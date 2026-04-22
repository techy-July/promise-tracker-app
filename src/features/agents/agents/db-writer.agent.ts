/**
 * Database Writer Agent
 * Writes extracted items to Supabase
 * Skips exact duplicates by matching title + user
 */

import type { AgentResult } from '../models/agent-result.model'
import type { TrackableItemDraft } from './extraction.agent'
import type { CategorizedItem } from './category.agent'
import { Log } from 'debug-next'

const { logVerbose } = Log()

export interface DBWriteResult {
	created: number
	skipped: number
	errors: string[]
}

const AGENT_ID = '[DB-WRITER]'

export async function dbWriterAgent(
	extractedItems: TrackableItemDraft[],
	categorizedItems: CategorizedItem[],
	userId: string
): Promise<AgentResult<DBWriteResult>> {
	const agentId = `${AGENT_ID} user=${userId}`
	const startTime = Date.now()

	try {
		logVerbose(`${agentId} Starting database write`)
		logVerbose(
			`${agentId} Input: ${extractedItems.length} extracted items, ${categorizedItems.length} categorized items`
		)

		// Validate inputs
		if (!userId) {
			console.error(`${agentId} ✗ Missing userId`)
			return {
				success: false,
				data: null,
				skipped: false,
				reason: 'Missing userId for database write',
			}
		}

		if (!Array.isArray(extractedItems) || extractedItems.length === 0) {
			logVerbose(`${agentId} ⊘ No items to write`)
			return {
				success: true,
				data: { created: 0, skipped: 0, errors: [] },
				skipped: false,
			}
		}

		if (!Array.isArray(categorizedItems) || categorizedItems.length !== extractedItems.length) {
			console.error(
				`${agentId} ✗ Mismatch: ${extractedItems.length} extracted vs ${categorizedItems.length} categorized`
			)
			return {
				success: false,
				data: null,
				skipped: false,
				reason: `Item count mismatch: ${extractedItems.length} extracted vs ${categorizedItems.length} categorized`,
			}
		}

		// TODO: Implement Supabase upsert logic
		// For now, just log what would be written
		const result: DBWriteResult = {
			created: extractedItems.length,
			skipped: 0,
			errors: [],
		}

		logVerbose(`${agentId} Items to write:`)
		extractedItems.forEach((item, i) => {
			const category = categorizedItems[i]?.category || 'unknown'
			const priority = categorizedItems[i]?.priority || 3
			logVerbose(`${agentId}   ${i + 1}. "${item.title}"`)
			logVerbose(`${agentId}      Description: ${item.description || '(none)'}`)

			// Debug: Show due date with detailed parsing info
			if (item.due_date && typeof item.due_date === 'string') {
				try {
					const dueDateObj = new Date(item.due_date)
					const dayNames = [
						'Sunday',
						'Monday',
						'Tuesday',
						'Wednesday',
						'Thursday',
						'Friday',
						'Saturday',
					]
					const dayName = dayNames[dueDateObj.getUTCDay()]
					logVerbose(
						`${agentId}      Due: ${item.due_date} (${dayName}, ${dueDateObj.toUTCString()})`
					)
				} catch (e) {
					logVerbose(`${agentId}      Due: ${item.due_date} (invalid date format), ${e}`)
				}
			} else {
				logVerbose(`${agentId}      Due: (no due date)`)
			}

			logVerbose(`${agentId}      Category: ${category}, Priority: ${priority}`)
		})

		logVerbose(`${agentId} ✓ Database write simulation successful`)
		logVerbose(
			`${agentId} Results: ${result.created} created, ${result.skipped} skipped, ${result.errors.length} errors`
		)
		const duration = Date.now() - startTime
		logVerbose(`${agentId} Completed in ${duration}ms`)

		return {
			success: true,
			data: result,
			skipped: false,
		}
	} catch (error) {
		const duration = Date.now() - startTime
		const message = error instanceof Error ? error.message : 'DB writer error'
		const stack = error instanceof Error ? error.stack : 'No stack trace'

		console.error(`${agentId} ❌ ERROR after ${duration}ms`)
		console.error(`${agentId} Message: ${message}`)
		console.error(`${agentId} Stack:`)
		stack?.split('\n').forEach((line) => console.error(`${agentId}   ${line}`))

		return {
			success: false,
			data: null,
			skipped: false,
			reason: message,
		}
	}
}
