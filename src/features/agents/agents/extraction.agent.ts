import type { AgentResult } from '../models/agent-result.model'
import type { EmailPayload } from '../models/email-payload.model'

/**
 * Extraction Agent
 * Parses email and extracts actionable items (tasks, deadlines, commitments)
 * Returns array of extracted items or skips if none found
 */

export interface ExtractedItem {
	title: string
	description?: string
	dueDate?: string // ISO 8601
	priority: 'high' | 'medium' | 'low'
	confidence: number // 0.0 - 1.0
}

export async function extractionAgent(
	emailPayload: EmailPayload
): Promise<AgentResult<ExtractedItem[]>> {
	try {
		// TODO: Call Anthropic API with extraction prompt
		// Should parse email body and extract actionable items
		// Return empty array if nothing found (will be caught in orchestrator as skipped)

		const items: ExtractedItem[] = []
		// STUB: No extraction logic yet

		if (items.length === 0) {
			return {
				success: true,
				data: null,
				skipped: true,
				reason: 'No actionable items extracted',
			}
		}

		return {
			success: true,
			data: items,
			skipped: false,
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Extraction error'
		return {
			success: false,
			data: null,
			skipped: false,
			reason: message,
		}
	}
}
