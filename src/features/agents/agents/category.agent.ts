/**
 * Category Agent
 * Categorizes extracted items and assigns priority
 * Uses local Ollama inference
 */

import type { AgentResult } from '../models/agent-result.model'
import type { TrackableItemDraft } from './extraction.agent'
import { callLLM, parseJsonResponse } from '../lib/ollama'
import { CATEGORY_PROMPT } from '../prompts/category.prompt'
import { Log } from 'debug-next'

const { logVerbose } = Log()

export interface CategorizedItem {
	category: string[] | string // TODO: Category should be pulling from the database or defined set, not freeform string
	priority: 1 | 2 | 3 // 1=low, 2=medium, 3=high
}

const AGENT_ID = '[CATEGORY]'

export async function categoryAgent(
	items: TrackableItemDraft[],
	userId: string
): Promise<AgentResult<CategorizedItem[]>> {
	const agentId = `${AGENT_ID} user=${userId}`
	const startTime = Date.now()

	try {
		logVerbose(`${agentId} Starting categorization`)
		logVerbose(`${agentId} Input: ${items.length} items to categorize`)
		items.forEach((item, i) => {
			logVerbose(`${agentId}   ${i + 1}. "${item.title}" (priority: ${item.priority})`)
		})

		// Priority mapping: convert string priorities to numeric 1-3 scale
		const priorityMap: Record<string, 1 | 2 | 3> = {
			low: 1,
			medium: 2,
			high: 3,
		}

		const itemTitles = items.map((item) => item.title)
		const prompt = CATEGORY_PROMPT.user(itemTitles)

		logVerbose(`${agentId} Calling LLM with categorization prompt`)
		const { text, tokensUsed } = await callLLM(prompt, CATEGORY_PROMPT.system)
		const duration = Date.now() - startTime

		logVerbose(`${agentId} LLM responded in ${duration}ms (${tokensUsed} tokens)`)
		logVerbose(`${agentId} Raw response length: ${text.length} chars`)
		logVerbose(`${agentId} Raw response preview: "${text.substring(0, 300)}"`)

		let result: any
		try {
			result = parseJsonResponse(text)
			logVerbose(
				`${agentId} Parsed JSON: ${typeof result} (${Array.isArray(result) ? 'array' : 'object'})`
			)
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

		// Handle array response (updated prompt format)
		let categoryResponses: any[] = []
		if (Array.isArray(result)) {
			logVerbose(`${agentId} Response is array with ${result.length} items`)
			categoryResponses = result
		} else if (result && typeof result === 'object') {
			logVerbose(`${agentId} Response is single object, converting to array`)
			categoryResponses = [result]
		} else {
			console.error(`${agentId} Unexpected response type: ${typeof result}`)
			return {
				success: false,
				data: null,
				skipped: false,
				reason: 'Invalid response structure from LLM',
			}
		}

		// Validate and transform to CategorizedItem[]
		const categorized: CategorizedItem[] = items.map((item, index) => {
			const response =
				categoryResponses[index] || (categoryResponses.length === 1 ? categoryResponses[0] : {})

			let category = response.category || 'other'
			if (Array.isArray(category)) {
				category = category[0] || 'other'
			}

			// Convert extraction priority (high/medium/low) to numeric (1-3)
			let priority: 1 | 2 | 3 = priorityMap[item.priority] || 2

			// Override with LLM response if provided
			if (response.priority !== undefined) {
				const llmPriority = Number(response.priority)
				if (typeof llmPriority === 'number' && !isNaN(llmPriority)) {
					// Clamp LLM response to 1-3
					priority = Math.max(1, Math.min(3, llmPriority)) as 1 | 2 | 3
				} else {
					console.warn(
						`${agentId}   Item ${index + 1}: Invalid LLM priority "${response.priority}", keeping extraction priority`
					)
				}
			}

			logVerbose(`${agentId}   Item ${index + 1}: category="${category}", priority=${priority}`)

			return {
				category,
				priority,
			}
		})

		logVerbose(`${agentId} ✓ Categorization successful: ${items.length} items categorized`)
		return {
			success: true,
			data: categorized,
			skipped: false,
			tokensUsed,
		}
	} catch (error) {
		const duration = Date.now() - startTime
		const message = error instanceof Error ? error.message : 'Category error'

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
