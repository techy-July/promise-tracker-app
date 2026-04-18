import type { AgentResult } from '../models/agent-result.model'
import type { ExtractedItem } from './extraction.agent'

/**
 * Category Agent
 * Assigns extracted items to existing user categories
 * Augments items with category_id
 */

export interface CategorizedItem extends ExtractedItem {
	category_id?: string
}

export async function categoryAgent(
	items: ExtractedItem[]
): Promise<AgentResult<CategorizedItem[]>> {
	try {
		// TODO: Call Anthropic API with category prompt
		// Should:
		// 1. Fetch user categories from DB
		// 2. Ask LLM to match items to categories
		// 3. Return items with category_id assigned

		const categorizedItems: CategorizedItem[] = items.map((item) => ({
			...item,
			category_id: undefined, // STUB: no categorization yet
		}))

		return {
			success: true,
			data: categorizedItems,
			skipped: false,
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Category error'
		return {
			success: false,
			data: null,
			skipped: false,
			reason: message,
		}
	}
}
