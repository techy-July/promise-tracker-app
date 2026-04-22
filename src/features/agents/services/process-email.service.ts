import type { EmailPayloadRequest, ProcessEmailResponse } from '@/lib/api/types'
import { orchestrator } from '../orchestrator'

/**
 * Service layer for processing emails
 * Handles business logic and orchestration
 */
export async function processEmail(
	emailPayload: EmailPayloadRequest,
	userId: string
): Promise<ProcessEmailResponse> {
	try {
		// Add userId and labelIds (with default) to payload
		const payload = {
			...emailPayload,
			userId,
			labelIds: emailPayload.labelIds || [],
		}

		// Call orchestrator
		const result = await orchestrator(payload)

		// Transform orchestrator result to API response
		if (!result.success) {
			return {
				success: false,
				error: 'Pipeline failed',
				details: result.reason || 'Unknown orchestrator error',
				code: 'ORCHESTRATOR_ERROR',
			}
		}

		if (result.skipped) {
			return {
				success: true,
				data: undefined,
				skipped: true,
				reason: result.reason,
			}
		}

		return {
			success: true,
			data: result.data || { created: 0, skipped: 0, errors: [] },
			skipped: false,
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error'
		return {
			success: false,
			error: 'Internal server error',
			details: message,
			code: 'SERVICE_ERROR',
		}
	}
}
