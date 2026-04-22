'use server'

import type { AgentResult } from './models/agent-result.model'
import type { EmailPayload } from './models/email-payload.model'
import { spamFilterAgent } from './agents/spam-filter.agent'
import { extractionAgent, type TrackableItemDraft } from './agents/extraction.agent'
import { categoryAgent } from './agents/category.agent'
import { dbWriterAgent } from './agents/db-writer.agent'
import { validateEmailDate } from './lib/date-diagnostic'
import { Log } from 'debug-next'

const { logVerbose } = Log()
/**
 * Orchestrator - runs email through multi-agent pipeline
 * Chains agents sequentially: spam → extraction → category → db-writer
 * Early exit if any agent skips
 */
export async function orchestrator(
	payload: EmailPayload & { userId: string }
): Promise<AgentResult<any>> {
	// TODO: type this properly
	const { userId, ...emailPayload } = payload
	const pipelineId = crypto.randomUUID()
	const startTime = Date.now()

	try {
		// Validate dates and show diagnostic info
		const emailDateValidation = validateEmailDate(emailPayload.date)
		logVerbose(`Processing started for [ORCHESTRATOR:${pipelineId}]`)
		if (emailDateValidation.warning) {
			console.warn(
				`[ORCHESTRATOR:${pipelineId}] ⚠ Email date warning: ${emailDateValidation.warning}`
			)
		}

		// Step 1: Spam filter
		const step1Start = Date.now()
		logVerbose(`[ORCHESTRATOR:${pipelineId}] ▶ Step 1/4: Spam Filter`)
		const spamResult = await spamFilterAgent(emailPayload)
		const step1Time = Date.now() - step1Start

		if (!spamResult.success) {
			console.error(`[ORCHESTRATOR:${pipelineId}] ✗ Spam filter error (${step1Time}ms)`)
			console.error(`[ORCHESTRATOR:${pipelineId}]   Reason: ${spamResult.reason}`)
			return spamResult
		}
		if (spamResult.skipped) {
			logVerbose(
				`[ORCHESTRATOR:${pipelineId}] ⊘ Email marked as spam - skipping pipeline (${step1Time}ms)`
			)
			return { success: true, data: null, skipped: true, reason: 'Spam detected' }
		}
		logVerbose(`[ORCHESTRATOR:${pipelineId}] ✓ Email is legitimate (${step1Time}ms)`)

		// Step 2: Extract actionable items
		const step2Start = Date.now()
		logVerbose(`\n[ORCHESTRATOR:${pipelineId}] ▶ Step 2/4: Extraction`)
		const extractionResult = await extractionAgent(emailPayload)
		const step2Time = Date.now() - step2Start

		if (!extractionResult.success) {
			console.error(`[ORCHESTRATOR:${pipelineId}] ✗ Extraction error (${step2Time}ms)`)
			console.error(`[ORCHESTRATOR:${pipelineId}]   Reason: ${extractionResult.reason}`)
			return extractionResult
		}
		if (extractionResult.skipped || !extractionResult.data) {
			logVerbose(`[ORCHESTRATOR:${pipelineId}] ⊘ No actionable items found (${step2Time}ms)`)
			return { success: true, data: null, skipped: true, reason: 'No actionable items' }
		}

		const extractedItems: TrackableItemDraft[] = extractionResult.data
		logVerbose(
			`[ORCHESTRATOR:${pipelineId}] ✓ Extracted ${extractedItems.length} item(s) (${step2Time}ms)`
		)
		extractedItems.forEach((item, i) => {
			logVerbose(
				`[ORCHESTRATOR:${pipelineId}]   ${i + 1}. "${item.title}" (due: ${item.due_date || 'none'})`
			)
		})

		// Step 3: Categorize items
		const step3Start = Date.now()
		logVerbose(`\n[ORCHESTRATOR:${pipelineId}] ▶ Step 3/4: Categorization`)
		const categoryResult = await categoryAgent(extractedItems, userId)
		const step3Time = Date.now() - step3Start

		if (!categoryResult.success) {
			console.error(`[ORCHESTRATOR:${pipelineId}] ✗ Categorization error (${step3Time}ms)`)
			console.error(`[ORCHESTRATOR:${pipelineId}]   Reason: ${categoryResult.reason}`)
			return categoryResult
		}
		if (!categoryResult.data) {
			console.error(
				`[ORCHESTRATOR:${pipelineId}] ✗ Categorization returned no data (${step3Time}ms)`
			)
			return { success: false, data: null, skipped: false, reason: 'Categorization failed' }
		}

		const categorizedItems = categoryResult.data
		logVerbose(
			`[ORCHESTRATOR:${pipelineId}] ✓ Categorized ${categorizedItems.length} item(s) (${step3Time}ms)`
		)

		// Step 4: Write to database
		const step4Start = Date.now()
		logVerbose(`\n[ORCHESTRATOR:${pipelineId}] ▶ Step 4/4: Database Write`)
		const dbResult = await dbWriterAgent(extractedItems, categorizedItems, userId)
		const step4Time = Date.now() - step4Start

		if (!dbResult.success) {
			console.error(`[ORCHESTRATOR:${pipelineId}] ✗ Database write error (${step4Time}ms)`)
			console.error(`[ORCHESTRATOR:${pipelineId}]   Reason: ${dbResult.reason}`)
			return dbResult
		}

		const created = dbResult.data?.created || 0
		const skipped = dbResult.data?.skipped || 0
		logVerbose(`[ORCHESTRATOR:${pipelineId}] ✓ Database write complete (${step4Time}ms)`)
		logVerbose(`[ORCHESTRATOR:${pipelineId}]   Created: ${created}, Skipped: ${skipped}`)

		// Success!
		const totalTime = Date.now() - startTime
		logVerbose(`\n[ORCHESTRATOR:${pipelineId}] ✅ Pipeline complete! (${totalTime}ms total)`)
		logVerbose(`[ORCHESTRATOR:${pipelineId}] Timeline:`)
		logVerbose(`[ORCHESTRATOR:${pipelineId}]   1. Spam:        ${step1Time}ms`)
		logVerbose(`[ORCHESTRATOR:${pipelineId}]   2. Extraction:  ${step2Time}ms`)
		logVerbose(`[ORCHESTRATOR:${pipelineId}]   3. Category:    ${step3Time}ms`)
		logVerbose(`[ORCHESTRATOR:${pipelineId}]   4. DB Write:    ${step4Time}ms\n`)

		return {
			success: true,
			data: dbResult.data,
			skipped: false,
		}
	} catch (error) {
		const totalTime = Date.now() - startTime
		const message = error instanceof Error ? error.message : 'Unknown orchestrator error'

		console.error(`\n[ORCHESTRATOR:${pipelineId}] ❌ CRITICAL ERROR (after ${totalTime}ms)`)
		console.error(`[ORCHESTRATOR:${pipelineId}] Message: ${message}`)

		return {
			success: false,
			data: null,
			skipped: false,
			reason: message,
		}
	}
}
