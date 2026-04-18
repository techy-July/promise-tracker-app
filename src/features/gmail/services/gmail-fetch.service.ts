'use server'

import type { GmailMessage } from '../models/gmail.model'
import type { EmailPayload } from '@/features/agents/models/email-payload.model'

/**
 * Gmail Fetch Service
 * Retrieves emails from Gmail API
 */

export async function getGmailMessages(
	userId: string,
	options?: {
		maxResults?: number
		pageToken?: string
		query?: string
	}
): Promise<GmailMessage[]> {
	// TODO: Call Gmail API to list messages
	// Use user's OAuth token from auth service
	// Parse and transform to GmailMessage interface

	return []
}

export async function getGmailMessage(
	userId: string,
	messageId: string
): Promise<GmailMessage | null> {
	// TODO: Fetch single message from Gmail API
	// Parse full message including body

	return null
}

export async function transformToEmailPayload(
	gmailMessage: GmailMessage,
	userId: string
): Promise<EmailPayload> {
	// TODO: Transform Gmail message to EmailPayload
	// Extract headers, parse body, normalize format

	return {
		id: gmailMessage.id,
		threadId: gmailMessage.threadId,
		subject: '',
		from: '',
		to: '',
		body: '',
		date: new Date().toISOString(),
		labelIds: gmailMessage.labelIds || [],
	}
}
