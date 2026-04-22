/**
 * Extraction Agent
 * Parses email and extracts actionable items (tasks, deadlines, commitments)
 * Uses local Ollama inference
 */

import type { AgentResult } from '../models/agent-result.model'
import type { EmailPayload } from '../models/email-payload.model'
import { callLLM, parseJsonResponse } from '../lib/ollama'
import { EXTRACTION_PROMPT } from '../prompts/extraction.prompt'
import { deduplicateItems } from '../lib/dedup-utils'
import { parseRelativeDate, getDayName, parseEmailDate } from '../lib/date-utils'
import { Log } from 'debug-next'

const { logVerbose } = Log()

export interface TrackableItemDraft {
	title: string
	description?: string
	due_date?: string | null
	priority: 'high' | 'medium' | 'low'
	confidence: number
}

const AGENT_ID = '[EXTRACTION]'

export async function extractionAgent(
	emailPayload: EmailPayload
): Promise<AgentResult<TrackableItemDraft[]>> {
	const agentId = `${AGENT_ID} ${emailPayload.id}`
	const startTime = Date.now()

	try {
		logVerbose(`${agentId} Starting extraction`)

		const prompt = EXTRACTION_PROMPT.user(
			emailPayload.subject,
			emailPayload.from,
			emailPayload.body
		)
		logVerbose(`${agentId} Calling LLM with extraction prompt`)

		const { text, tokensUsed } = await callLLM(prompt, EXTRACTION_PROMPT.system)
		const duration = Date.now() - startTime

		logVerbose(`${agentId} LLM responded in ${duration}ms (${tokensUsed} tokens)`)
		logVerbose(`${agentId} Raw response length: ${text.length} chars`)
		logVerbose(`${agentId} Raw response preview: "${text.substring(0, 200)}"`)

		let items: TrackableItemDraft[]
		try {
			items = parseJsonResponse(text)
		} catch (parseError) {
			console.error(`${agentId} Failed to parse LLM response as JSON`)
			console.error(`${agentId} Raw text: "${text}"`)
			return {
				success: false,
				data: null,
				skipped: false,
				reason: `JSON parse error: ${parseError instanceof Error ? parseError.message : 'Unknown'}`,
			}
		}
		// TODO: make sure this is a valid array without throwing an error, handle gracefully
		// Validate response structure
		if (!Array.isArray(items)) {
			console.error(`${agentId} Response is not an array: ${typeof items}`)
			return {
				success: false,
				data: null,
				skipped: false,
				reason: 'Invalid response: expected array of items',
			}
		}

		logVerbose(`${agentId} Received ${items.length} items (before filtering)`)

		if (items.length === 0) {
			logVerbose(`${agentId} ⊘ No items extracted`)
			return {
				success: true,
				data: null,
				skipped: true,
				reason: 'No actionable items extracted',
				tokensUsed,
			}
		}

		// Validate each item structure
		const validItems: TrackableItemDraft[] = []

		// Parse email date to use as reference for date calculations
		const emailDate = parseEmailDate(emailPayload.date)
		const emailDateStr = emailDate.toISOString().split('T')[0]
		logVerbose(`${agentId} Using email date as reference: ${emailDateStr}`)

		items.forEach((item, i) => {
			logVerbose(
				`${agentId} Item ${i + 1}: title="${item.title}", priority=${item.priority}, confidence=${item.confidence}`
			)

			if (!item.title) {
				console.warn(`${agentId}   ⚠ Missing title, skipping`)
				return
			}
			if (typeof item.priority !== 'string' || !['high', 'medium', 'low'].includes(item.priority)) {
				console.warn(`${agentId}   ⚠ Invalid priority "${item.priority}", defaulting to "medium"`)
				item.priority = 'medium'
			}
			if (typeof item.confidence !== 'number' || item.confidence < 0 || item.confidence > 1) {
				console.warn(`${agentId}   ⚠ Invalid confidence ${item.confidence}, defaulting to 0.5`)
				item.confidence = 0.5
			}

			// Parse relative dates (e.g., "by Friday" → "2026-04-25")
			// Using email's send date as reference for accurate calculation
			if (item.due_date && typeof item.due_date === 'string') {
				const parsed = parseRelativeDate(item.due_date, emailDate)
				if (parsed) {
					const dayName = getDayName(parsed)
					logVerbose(`${agentId}   ℹ Parsed date "${item.due_date}" → "${parsed}" (${dayName})`)
					item.due_date = parsed
				}
			}

			validItems.push(item)
		})

		logVerbose(`${agentId} Validated ${validItems.length} items (all valid)`)

		// Deduplicate similar items
		logVerbose(`${agentId} Running deduplication...`)
		const beforeDedup = validItems.length
		const deduplicated = deduplicateItems(validItems)
		const afterDedup = deduplicated.length

		if (beforeDedup > afterDedup) {
			logVerbose(`${agentId} ✓ Merged ${beforeDedup - afterDedup} duplicate item(s)`)
			deduplicated.forEach((item, i) => {
				logVerbose(
					`${agentId}   ${i + 1}. "${item.title}" (confidence: ${item.confidence.toFixed(2)}, due: ${item.due_date || 'none'})`
				)
			})
		} else {
			logVerbose(`${agentId} No duplicates found`)
		}

		// Filter by confidence threshold
		const filtered = deduplicated.filter((item) => item.confidence > 0.5)
		logVerbose(`${agentId} After confidence filter (>0.5): ${filtered.length} items`)

		if (filtered.length === 0) {
			logVerbose(`${agentId} ⊘ No items met confidence threshold`)
			return {
				success: true,
				data: null,
				skipped: true,
				reason: 'No items met confidence threshold (0.5)',
				tokensUsed,
			}
		}

		logVerbose(`${agentId} ✓ Extraction successful: ${filtered.length} items`)
		return {
			success: true,
			data: filtered,
			skipped: false,
			tokensUsed,
		}
	} catch (error) {
		const duration = Date.now() - startTime
		const message = error instanceof Error ? error.message : 'Extraction error'

		console.error(`${agentId} ❌ ERROR after ${duration}ms`)
		console.error(`${agentId} Message: ${message}`)

		return {
			success: false,
			data: null,
			skipped: false,
			reason: message,
		}
	}
}
