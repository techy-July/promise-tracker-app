'use server'

import { google } from 'googleapis'
import { getGmailToken } from './gmail-auth.service'
import type { GmailMessage } from '../models/gmail.model'
import type { EmailPayload } from '@/features/agents/models/email-payload.model'

const gmail = google.gmail('v1')

/**
 * Gmail Fetch Service
 * Retrieves emails from Gmail API and transforms them
 */

/**
 * List messages from Gmail inbox
 */
export async function getGmailMessages(
	userId: string,
	options?: {
		maxResults?: number
		pageToken?: string
		query?: string
	}
): Promise<GmailMessage[]> {
	const tokenData = await getGmailToken(userId)
	if (!tokenData) {
		throw new Error('No Gmail token found for user')
	}

	const auth = new google.auth.OAuth2(
		process.env.GOOGLE_CLIENT_ID,
		process.env.GOOGLE_CLIENT_SECRET,
		process.env.GOOGLE_REDIRECT_URI
	)
	auth.setCredentials({
		access_token: tokenData.access_token,
		refresh_token: tokenData.refresh_token,
	})

	try {
		const response = await gmail.users.messages.list({
			auth,
			userId: 'me',
			maxResults: options?.maxResults || 10,
			pageToken: options?.pageToken,
			q: options?.query || 'in:inbox',
		})

		return (response.data.messages || []) as GmailMessage[]
	} catch (err) {
		throw new Error(
			`Failed to fetch Gmail messages: ${err instanceof Error ? err.message : 'Unknown error'}`
		)
	}
}

/**
 * Fetch single message from Gmail API with full details
 */
export async function getGmailMessage(
	userId: string,
	messageId: string
): Promise<GmailMessage | null> {
	const tokenData = await getGmailToken(userId)
	if (!tokenData) {
		throw new Error('No Gmail token found for user')
	}

	const auth = new google.auth.OAuth2(
		process.env.GOOGLE_CLIENT_ID,
		process.env.GOOGLE_CLIENT_SECRET,
		process.env.GOOGLE_REDIRECT_URI
	)
	auth.setCredentials({
		access_token: tokenData.access_token,
		refresh_token: tokenData.refresh_token,
	})

	try {
		const response = await gmail.users.messages.get({
			auth,
			userId: 'me',
			id: messageId,
			format: 'full',
		})

		return response.data as GmailMessage
	} catch (err) {
		console.error(`Failed to fetch message ${messageId}:`, err)
		return null
	}
}

/**
 * Transform Gmail message to EmailPayload
 * Extracts headers, decodes body, normalizes format
 */
export async function transformToEmailPayload(
	gmailMessage: GmailMessage,
	userId: string
): Promise<EmailPayload> {
	const headers = gmailMessage.payload?.headers || []

	// Extract header values
	const getHeader = (name: string): string => {
		const header = headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())
		return header?.value || ''
	}

	const subject = getHeader('subject')
	const from = getHeader('from')
	const to = getHeader('to')
	const date = getHeader('date')

	// Extract body
	let body = ''
	if (gmailMessage.payload?.body?.data) {
		// Body is base64url encoded
		body = Buffer.from(gmailMessage.payload.body.data, 'base64url').toString('utf-8')
	} else if (gmailMessage.payload?.parts) {
		// Multipart message - find text/plain or text/html
		const textPart = gmailMessage.payload.parts.find((part) => part.mimeType === 'text/plain')
		const htmlPart = gmailMessage.payload.parts.find((part) => part.mimeType === 'text/html')

		const part = textPart || htmlPart
		if (part?.body?.data) {
			let text = Buffer.from(part.body.data, 'base64url').toString('utf-8')

			// Strip HTML tags if this was HTML
			if (part.mimeType === 'text/html') {
				text = text
					.replace(/<[^>]*>/g, '') // Remove HTML tags
					.replace(/&nbsp;/g, ' ') // Replace &nbsp;
					.replace(/&lt;/g, '<') // Replace &lt;
					.replace(/&gt;/g, '>') // Replace &gt;
					.replace(/&amp;/g, '&') // Replace &amp;
					.replace(/\r\n/g, '\n') // Normalize line breaks
			}

			body = text
		}
	}

	// Truncate body to 3000 chars (token limit consideration)
	body = body.substring(0, 3000)

	// Parse date to ISO 8601
	let isoDate = new Date().toISOString()
	if (date) {
		isoDate = new Date(date).toISOString()
	} else if (gmailMessage.internalDate) {
		isoDate = new Date(Number(gmailMessage.internalDate)).toISOString()
	}

	return {
		id: gmailMessage.id,
		threadId: gmailMessage.threadId,
		subject,
		from,
		to,
		body: body.trim(),
		date: isoDate,
		labelIds: gmailMessage.labelIds || [],
	}
}

/**
 * Fetch messages by thread ID
 */
export async function getGmailThread(userId: string, threadId: string): Promise<GmailMessage[]> {
	const tokenData = await getGmailToken(userId)
	if (!tokenData) {
		throw new Error('No Gmail token found for user')
	}

	const auth = new google.auth.OAuth2(
		process.env.GOOGLE_CLIENT_ID,
		process.env.GOOGLE_CLIENT_SECRET,
		process.env.GOOGLE_REDIRECT_URI
	)
	auth.setCredentials({
		access_token: tokenData.access_token,
		refresh_token: tokenData.refresh_token,
	})

	try {
		const response = await gmail.users.threads.get({
			auth,
			userId: 'me',
			id: threadId,
			format: 'full',
		})

		return (response.data.messages || []) as GmailMessage[]
	} catch (err) {
		throw new Error(
			`Failed to fetch thread ${threadId}: ${err instanceof Error ? err.message : 'Unknown error'}`
		)
	}
}
