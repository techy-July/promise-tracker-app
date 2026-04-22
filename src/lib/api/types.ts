/**
 * API Response Types
 */

export interface ProcessEmailResponse {
	success: boolean
	data?: {
		created: number
		skipped: number
		errors: string[]
	}
	skipped?: boolean
	reason?: string
	error?: string
	details?: string
	code?: string
}

export interface EmailPayloadRequest {
	id: string
	threadId: string
	from: string
	to: string
	date: string
	subject: string
	body: string
	labelIds?: string[]
}
