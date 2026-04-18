/**
 * Email Payload - standardized email data for agents
 * Passed through the entire agent pipeline
 */
export interface EmailPayload {
	id: string // Gmail message ID
	threadId: string
	subject: string
	from: string // "Name <email>"
	to: string
	body: string // plain text only, HTML stripped
	date: string // ISO 8601
	labelIds: string[]
}

/**
 * Helper to create email payload from Gmail API response
 */
export function createEmailPayload(gmailMessage: Record<string, any>): EmailPayload {
	// This is a placeholder; actual implementation depends on Gmail API response structure
	return {
		id: gmailMessage.id,
		threadId: gmailMessage.threadId,
		subject: gmailMessage.subject || '',
		from: gmailMessage.from || '',
		to: gmailMessage.to || '',
		body: gmailMessage.body || '',
		date: gmailMessage.date || new Date().toISOString(),
		labelIds: gmailMessage.labelIds || [],
	}
}
