import { type NextRequest, NextResponse } from 'next/server'
import { orchestrator } from '@/features/agents/orchestrator'
import type { EmailPayload } from '@/features/agents/models/email-payload.model'
import { createTypedServerClient } from '@/lib/supabase-typed-server'

/**
 * POST /api/agents/process
 * Manual trigger for email processing via paste-to-extract UI
 * Accepts EmailPayload and runs through orchestrator
 *
 * Used by:
 * - Web UI paste-to-extract form
 * - Extension manual forwarding
 */

export async function POST(request: NextRequest) {
	try {
		// Authenticate user
		const supabase = await createTypedServerClient()
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser()

		if (userError || !user) {
			return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
		}

		// Parse request body
		const emailPayload: EmailPayload = await request.json()

		// Validate email payload
		if (!emailPayload.id || !emailPayload.from || !emailPayload.body) {
			return NextResponse.json({ success: false, error: 'Invalid email payload' }, { status: 400 })
		}

		// Run through orchestrator
		const result = await orchestrator(emailPayload)

		// Return result (even if skipped, it's a valid response)
		return NextResponse.json({
			success: result.success,
			data: result.data,
			skipped: result.skipped,
			reason: result.reason,
		})
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error'
		return NextResponse.json({ success: false, error: message }, { status: 500 })
	}
}
