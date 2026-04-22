import { validateEmailPayload } from '../validators/email-payload.validator'
import { processEmail } from '../services/process-email.service'
import type { EmailPayloadRequest, ProcessEmailResponse } from '@/lib/api/types'
import type { NextRequest } from 'next/server'
import { Log } from 'debug-next'

const { logVerbose } = Log()

/**
 * Handle email processing request
 * Processes validation, service delegation, and response formatting
 */
export async function handleProcessEmail(
	request: NextRequest,
	requestId: string
): Promise<{ response: ProcessEmailResponse; status: number }> {
	try {
		// Step 1: Extract and validate user ID
		logVerbose(`[${requestId}] Step 1: Validating headers...`)
		const userId = request.headers.get('x-user-id')

		if (!userId) {
			console.warn(`[${requestId}] ✗ Missing x-user-id header`)
			return {
				response: {
					success: false,
					error: 'Unauthorized',
					details: 'x-user-id header is required',
					code: 'MISSING_USER_ID',
				},
				status: 401,
			}
		}
		logVerbose(`[${requestId}] ✓ User ID: ${userId}`)

		// Step 2: Parse request body
		logVerbose(`[${requestId}] Step 2: Parsing request body...`)
		let emailPayload: EmailPayloadRequest

		try {
			emailPayload = await request.json()
		} catch (parseError) {
			console.error(`[${requestId}] ✗ JSON parse error:`, parseError)
			return {
				response: {
					success: false,
					error: 'Invalid JSON',
					details:
						parseError instanceof Error ? parseError.message : 'Failed to parse request body',
					code: 'JSON_PARSE_ERROR',
				},
				status: 400,
			}
		}

		// Step 3: Validate email payload
		logVerbose(`[${requestId}] Step 3: Validating email payload...`)
		const validationErrors = validateEmailPayload(emailPayload)

		if (validationErrors.length > 0) {
			console.error(`[${requestId}] ✗ Validation failed:`, validationErrors)
			return {
				response: {
					success: false,
					error: 'Invalid email payload',
					details: validationErrors.join(', '),
					code: 'VALIDATION_ERROR',
				},
				status: 400,
			}
		}

		logVerbose(`[${requestId}] ✓ Email payload valid`)
		logVerbose(`[${requestId}]   - From: ${emailPayload.from}`)
		logVerbose(`[${requestId}]   - Subject: ${emailPayload.subject}`)
		logVerbose(`[${requestId}]   - Date: ${emailPayload.date}`)
		logVerbose(`[${requestId}]   - Body length: ${emailPayload.body.length} chars`)

		// Step 4: Call service
		logVerbose(`[${requestId}] Step 4: Processing email...`)
		const result = await processEmail(emailPayload, userId)

		if (result.success) {
			logVerbose(`[${requestId}] ✅ Email processed successfully`)
			if (result.data) {
				logVerbose(`[${requestId}]   - Created items: ${result.data.created}`)
				logVerbose(`[${requestId}]   - Skipped: ${result.data.skipped}`)
			}
			return {
				response: result,
				status: 200,
			}
		}
		console.error(`[${requestId}] ✗ Email processing failed:`, result.error)
		return {
			response: result,
			status: 500,
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error'
		const stack = error instanceof Error ? error.stack : 'No stack trace'

		console.error(`[${requestId}] ❌ CRITICAL ERROR`)
		console.error(`[${requestId}]   Message: ${message}`)
		console.error(`[${requestId}]   Stack: ${stack}`)

		return {
			response: {
				success: false,
				error: 'Internal server error',
				details: message,
				code: 'INTERNAL_ERROR',
			},
			status: 500,
		}
	}
}
