import type { AgentResult } from '../models/agent-result.model'
import type { EmailPayload } from '../models/email-payload.model'
import type { CategorizedItem } from './category.agent'

/**
 * Reply Tracker Agent
 * Determines which items are awaiting user's reply
 * Augments items with awaited_reply flag and estimated reply_tracking info
 */

export interface TrackedItem extends CategorizedItem {
	awaited_reply: boolean
	reply_channel_id?: string
}

export async function replyTrackerAgent(
	emailPayload: EmailPayload,
	items: CategorizedItem[]
): Promise<AgentResult<TrackedItem[]>> {
	try {
		// TODO: Call Anthropic API with reply-tracker prompt
		// Should determine if items require user to reply back
		// Check email sender, tone, question markers, etc.

		const trackedItems: TrackedItem[] = items.map((item) => ({
			...item,
			awaited_reply: false, // STUB: no tracking yet
			reply_channel_id: undefined,
		}))

		return {
			success: true,
			data: trackedItems,
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
