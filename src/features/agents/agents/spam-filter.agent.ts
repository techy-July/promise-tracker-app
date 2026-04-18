import type { AgentResult } from '../models/agent-result.model'
import type { EmailPayload } from '../models/email-payload.model'

/**
 * Spam Filter Agent
 * Determines if email is spam/unwanted
 * Returns skipped=true if spam detected, allowing early exit from pipeline
 */
export async function spamFilterAgent(emailPayload: EmailPayload): Promise<AgentResult<null>> {
	try {
		// TODO: Call Anthropic API with spam-filter prompt
		// For now: stub that never marks as spam
		return {
			success: true,
			data: null,
			skipped: false,
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Spam filter error'
		return {
			success: false,
			data: null,
			skipped: false,
			reason: message,
		}
	}
}
