import { z } from 'zod'
import type { EmailPayloadRequest } from '@/lib/api/types'

/**
 * Zod schema for email payload validation
 */
export const emailPayloadSchema = z.object({
	id: z.string().min(1, 'id is required'),
	threadId: z.string().min(1, 'threadId is required'),
	from: z.string().min(1, 'from is required'),
	to: z.string().min(1, 'to is required'),
	date: z.string().min(1, 'date is required'),
	subject: z.string().min(1, 'subject is required'),
	body: z.string().min(1, 'body is required'),
	labelIds: z.array(z.string()).optional(),
})

/**
 * Validate email payload structure
 * @returns array of validation errors (empty if valid)
 */
export function validateEmailPayload(payload: unknown): string[] {
	const result = emailPayloadSchema.safeParse(payload)

	if (!result.success) {
		return result.error.issues.map((err) => {
			const path = err.path.length > 0 ? ` (${err.path.join('.')})` : ''
			return `${err.message}${path}`
		})
	}

	return []
}

/**
 * Type guard to check if payload is valid EmailPayloadRequest
 */
export function isValidEmailPayload(payload: unknown): payload is EmailPayloadRequest {
	const errors = validateEmailPayload(payload)
	return errors.length === 0
}
