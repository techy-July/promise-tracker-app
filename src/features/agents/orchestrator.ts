'use server'

import type { AgentResult } from './models/agent-result.model'
import type { EmailPayload } from './models/email-payload.model'
import { spamFilterAgent } from './agents/spam-filter.agent'
import { extractionAgent } from './agents/extraction.agent'
import { categoryAgent } from './agents/category.agent'
import { replyTrackerAgent } from './agents/reply-tracker.agent'
import { dbWriterAgent } from './agents/db-writer.agent'

/**
 * Orchestrator - runs email through multi-agent pipeline
 * Chains agents sequentially: spam → extraction → category → reply-tracker → db-writer
 * Early exit if any agent skips (e.g., spam detected)
 */
export async function orchestrator(emailPayload: EmailPayload): Promise<AgentResult<any>> {
	try {
		// Step 1: Spam filter
		const spamResult = await spamFilterAgent(emailPayload)
		if (!spamResult.success) {
			return spamResult
		}
		if (spamResult.skipped) {
			return { success: true, data: null, skipped: true, reason: 'Spam detected' }
		}

		// Step 2: Extract actionable items
		const extractionResult = await extractionAgent(emailPayload)
		if (!extractionResult.success) {
			return extractionResult
		}
		if (extractionResult.skipped || !extractionResult.data) {
			return { success: true, data: null, skipped: true, reason: 'No actionable items found' }
		}

		const extractedItems = extractionResult.data

		// Step 3: Categorize items
		const categoryResult = await categoryAgent(extractedItems)
		if (!categoryResult.success) {
			return categoryResult
		}
		if (!categoryResult.data) {
			return {
				success: false,
				data: null,
				skipped: false,
				reason: 'Category agent returned no data',
			}
		}

		const categorizedItems = categoryResult.data

		// Step 4: Track reply status
		const replyTrackingResult = await replyTrackerAgent(emailPayload, categorizedItems)
		if (!replyTrackingResult.success) {
			return replyTrackingResult
		}
		if (!replyTrackingResult.data) {
			return {
				success: false,
				data: null,
				skipped: false,
				reason: 'Reply tracker agent returned no data',
			}
		}

		const itemsWithReplyStatus = replyTrackingResult.data

		// Step 5: Write to database
		const dbResult = await dbWriterAgent(emailPayload, itemsWithReplyStatus)
		if (!dbResult.success) {
			return dbResult
		}

		return {
			success: true,
			data: dbResult.data,
			skipped: false,
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown orchestrator error'
		return {
			success: false,
			data: null,
			skipped: false,
			reason: message,
		}
	}
}
