import type { AgentResult } from '../models/agent-result.model'

/**
 * Reply Tracker Agent (STUB)
 * Determines which items are awaiting user's reply
 * Currently a stub - enhanced later
 */

export async function replyTrackerAgent(items: any[]): Promise<AgentResult<any[]>> {
	try {
		// STUB: No reply tracking for now
		return {
			success: true,
			data: items,
			skipped: false,
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Reply tracker error'
		return {
			success: false,
			data: null,
			skipped: false,
			reason: message,
		}
	}
}
