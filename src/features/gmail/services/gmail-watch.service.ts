'use server'

/**
 * Gmail Watch Service
 * Handles Gmail Pub/Sub push notifications for new emails
 * Sets up watch triggers and processes incoming webhooks
 */

export async function setupGmailWatch(userId: string, webhookUrl: string): Promise<string> {
	// TODO: Call Gmail API watch() endpoint
	// Sets up push notifications to webhookUrl
	// Returns historyId for incremental sync

	return ''
}

export async function processGmailPushNotification(pushMessage: {
	subscription: string
	message: {
		attributes: {
			email: string
			historyId: string
		}
	}
}): Promise<void> {
	// TODO: Handle Pub/Sub push notification
	// Extract user email and historyId
	// Fetch new messages since last historyId
	// Queue for orchestrator processing
	// IMPORTANT: Always return 200 OK to prevent retries
}

export async function stopGmailWatch(userId: string): Promise<void> {
	// TODO: Stop watch for user
	// Call Gmail API stop() endpoint to cancel push notifications
}
