/**
 * Spam Filter Agent
 * Determines if email is spam/unwanted
 * Uses local Ollama inference
 */

import type { AgentResult } from '../models/agent-result.model'
import type { EmailPayload } from '../models/email-payload.model'
import { callLLM, parseJsonResponse } from '../lib/ollama'
import { SPAM_FILTER_PROMPT } from '../prompts/spam-filter.prompt'
import { Log } from 'debug-next'

const { logVerbose } = Log()
const AGENT_ID = '[SPAM-FILTER]'

export async function spamFilterAgent(emailPayload: EmailPayload): Promise<AgentResult<boolean>> {
	const agentId = `${AGENT_ID} ${emailPayload.id}`
	const startTime = Date.now()

	try {
		logVerbose(`${agentId} Starting spam detection`)
		logVerbose(`${agentId} Input: subject="${emailPayload.subject}", from="${emailPayload.from}"`)

		const preview = emailPayload.body.substring(0, 200)
		logVerbose(`${agentId} Body preview: "${preview.substring(0, 100)}..."`)

		const prompt = SPAM_FILTER_PROMPT.user(emailPayload.subject, emailPayload.from, preview)
		logVerbose(`${agentId} Calling LLM with spam detection prompt`)

		const { text, tokensUsed } = await callLLM(prompt, SPAM_FILTER_PROMPT.system)
		const duration = Date.now() - startTime

		logVerbose(`${agentId} LLM responded in ${duration}ms (${tokensUsed} tokens)`)
		logVerbose(`${agentId} Raw response: "${text.substring(0, 200)}"`)

		// TODO: typecast the expected result output
		let result
		try {
			result = parseJsonResponse(text)
			logVerbose(
				`${agentId} Parsed JSON: isLegitimate=${result.isLegitimate}, confidence=${result.confidence}`
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

		// Validate result structure
		if (typeof result.isLegitimate !== 'boolean') {
			console.error(
				`${agentId} Invalid response: isLegitimate is not boolean (got ${typeof result.isLegitimate})`
			)
			return {
				success: false,
				data: null,
				skipped: false,
				reason: 'Invalid LLM response structure',
			}
		}

		if (typeof result.confidence !== 'number' || result.confidence < 0 || result.confidence > 1) {
			console.warn(`${agentId} Invalid confidence: ${result.confidence}, using 0.5`)
			result.confidence = 0.5
		}

		// Return true = legitimate (should process), false = spam (skip)
		const isLegitimate = result.isLegitimate === true

		if (!isLegitimate && result.confidence > 0.7) {
			logVerbose(`${agentId} ⊘ SPAM DETECTED (confidence: ${result.confidence.toFixed(2)})`)
			logVerbose(`${agentId} Reason: ${result.reason || 'No reason provided'}`)
			return {
				success: true,
				data: false, // Skip this email - it's spam
				skipped: true,
				reason: `Spam detected (${result.confidence.toFixed(2)} confidence): ${result.reason}`,
				tokensUsed,
			}
		}

		logVerbose(
			`${agentId} ✓ Email is legitimate (confidence: ${(1 - result.confidence).toFixed(2)})`
		)
		return {
			success: true,
			data: true, // Process this email - it's legitimate
			skipped: false,
			tokensUsed,
		}
	} catch (error) {
		const duration = Date.now() - startTime
		const message = error instanceof Error ? error.message : 'Spam filter error'

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
