import { randomUUID } from 'crypto'
import { handleProcessEmail } from '@/features/agents/controllers/process-email.controller'
import { type NextRequest, NextResponse } from 'next/server'
import type { ProcessEmailResponse } from '@/lib/api/types'

/**
 * POST /api/agents/process
 * Processes email and extracts actionable items
 *
 * Required header: x-user-id
 * Request body: EmailPayloadRequest
 * Response: ProcessEmailResponse
 */

export async function POST(request: NextRequest): Promise<NextResponse<ProcessEmailResponse>> {
	const requestId = randomUUID()

	const { response, status } = await handleProcessEmail(request, requestId)

	return NextResponse.json(response, { status })
}
