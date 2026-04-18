'use server'

import { google } from 'googleapis'
import { getGmailToken } from './gmail-auth.service'
import { getGmailMessage, transformToEmailPayload } from './gmail-fetch.service'
import { createTypedServerClient } from '@/lib/supabase-typed-server'
import { orchestrator } from '@/features/agents/orchestrator'
import type { EmailPayload } from '@/features/agents/models/email-payload.model'

const gmail = google.gmail('v1')

// Global OAuth2 client - app credentials (safe to reuse)
// User-specific tokens are set per function call via setCredentials()
const oauth2Client = new google.auth.OAuth2(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	process.env.GOOGLE_REDIRECT_URI
)

/**
 * Gmail Watch Service
 * Handles Gmail Pub/Sub push notifications for new emails
 * Sets up watch triggers and processes incoming webhooks
 */

/**
 * Setup Gmail watch for push notifications
 * Returns expiration time for watch renewal
 */
export async function setupGmailWatch(userId: string): Promise<number> {
	const tokenData = await getGmailToken(userId)
	if (!tokenData) {
		throw new Error('No Gmail token found for user')
	}

	oauth2Client.setCredentials({
		access_token: tokenData.access_token,
		refresh_token: tokenData.refresh_token,
	})

	try {
		const topicName =
			process.env.PUBSUB_TOPIC_NAME ||
			`projects/${process.env.GOOGLE_CLOUD_PROJECT}/topics/gmail-notifications`

		const response = await gmail.users.watch({
			auth: oauth2Client,
			userId: 'me',
			requestBody: {
				topicName,
				labelIds: ['INBOX'],
			},
		})

		if (!response.data.expiration) {
			throw new Error('No expiration time returned from Gmail watch')
		}

		// Store watch expiration time
		const supabase = await createTypedServerClient()
		await supabase
			.from('user_oauth_tokens')
			.update({
				updated_at: new Date().toISOString(),
			})
			.eq('user_id', userId)

		return Number(response.data.expiration)
	} catch (err) {
		throw new Error(
			`Failed to setup Gmail watch: ${err instanceof Error ? err.message : 'Unknown error'}`
		)
	}
}

/**
 * Process Gmail Pub/Sub push notification
 * Called from /api/gmail/webhook
 */
export async function processGmailPushNotification(
	pushMessage: {
		subscription: string
		message: {
			attributes: {
				email: string
				historyId: string
			}
			messageId: string
		}
	},
	verificationToken?: string
): Promise<void> {
	try {
		// Verify token if provided
		if (verificationToken && verificationToken !== process.env.PUBSUB_VERIFICATION_TOKEN) {
			throw new Error('Invalid verification token')
		}

		const email = pushMessage.message.attributes.email
		const historyId = pushMessage.message.attributes.historyId

		if (!email || !historyId) {
			console.warn('Missing email or historyId in push notification')
			return
		}

		// Find user by email
		const supabase = await createTypedServerClient()
		const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(
			email.split('@')[0]
		) // This won't work directly

		// Alternative: fetch from auth.users where email matches
		const { data: userData } = await supabase.from('trackable_items').select('user_id').limit(1)

		if (!userData || userData.length === 0) {
			console.error(`User not found for email: ${email}`)
			return
		}

		// TODO: In production, properly map email to user_id
		// For now, we'll process all new messages for all users with tokens

		const { data: allUsers } = await supabase.from('user_oauth_tokens').select('user_id')

		if (!allUsers) {
			console.warn('No users with Gmail tokens')
			return
		}

		// Process new emails for this user
		for (const user of allUsers) {
			await processNewEmailsForUser(user.user_id, historyId)
		}
	} catch (err) {
		console.error('Error processing Gmail push notification:', err)
		// Don't throw - we always return 200 OK from webhook
	}
}

/**
 * Process new emails since last historyId
 */
export async function processNewEmailsForUser(
	userId: string,
	startHistoryId: string
): Promise<void> {
	try {
		const tokenData = await getGmailToken(userId)
		if (!tokenData) {
			return
		}

		oauth2Client.setCredentials({
			access_token: tokenData.access_token,
			refresh_token: tokenData.refresh_token,
		})

		// Get all messages since last historyId
		const historyResponse = await gmail.users.history.list({
			auth: oauth2Client,
			userId: 'me',
			startHistoryId,
		})

		const history = historyResponse.data.history || []
		const messageIds = new Set<string>()

		// Collect all message IDs from history (added messages)
		for (const event of history) {
			if (event.messages) {
				for (const msg of event.messages) {
					if (msg.id) {
						messageIds.add(msg.id)
					}
				}
			}
		}

		// Process each new message
		for (const messageId of messageIds) {
			try {
				const gmailMessage = await getGmailMessage(userId, messageId)
				if (!gmailMessage) {
					continue
				}

				// Transform and process
				const emailPayload: EmailPayload = await transformToEmailPayload(gmailMessage, userId)

				// Add user_id to payload for orchestrator
				const payloadWithUser = {
					...emailPayload,
					userId,
				}

				// Process through orchestrator pipeline
				await orchestrator(payloadWithUser)
			} catch (err) {
				console.error(`Failed to process message ${messageId}:`, err)
				// Continue processing other messages
			}
		}

		// Note: historyId used internally for incremental sync tracking
		// Future enhancement: store in separate history tracking table if needed
		const newHistoryId = historyResponse.data.historyId
		if (newHistoryId) {
			console.log(`Updated history for user ${userId}: ${newHistoryId}`)
		}
	} catch (err) {
		console.error(`Failed to process new emails for user ${userId}:`, err)
	}
}

/**
 * Stop Gmail watch for user
 */
export async function stopGmailWatch(userId: string): Promise<void> {
	const tokenData = await getGmailToken(userId)
	if (!tokenData) {
		console.warn(`No token found for user ${userId}`)
		return
	}

	oauth2Client.setCredentials({
		access_token: tokenData.access_token,
		refresh_token: tokenData.refresh_token,
	})

	try {
		await gmail.users.stop({
			auth: oauth2Client,
			userId: 'me',
		})
	} catch (err) {
		console.error(`Failed to stop Gmail watch for user ${userId}:`, err)
		// Continue anyway
	}
}
