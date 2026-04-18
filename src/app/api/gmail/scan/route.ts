import { type NextRequest, NextResponse } from 'next/server'
import { createTypedServerClient } from '@/lib/supabase-typed-server'

/**
 * GET /api/gmail/scan
 * Returns current scan status and progress
 *
 * POST /api/gmail/scan
 * Triggers bulk scan of user inbox
 * Starts background job to fetch and process emails
 */

export async function GET(request: NextRequest) {
	try {
		const supabase = await createTypedServerClient()
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser()

		if (userError || !user) {
			return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
		}

		// TODO: Query scan_logs table for latest scan
		// Return status, progress, etc.

		return NextResponse.json({
			status: 'idle',
			progress: 0,
			total: 0,
		})
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error'
		return NextResponse.json({ error: message }, { status: 500 })
	}
}

export async function POST(request: NextRequest) {
	try {
		const supabase = await createTypedServerClient()
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser()

		if (userError || !user) {
			return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
		}

		// TODO: Create scan_log entry
		// TODO: Queue background job to fetch emails
		// TODO: Return scan ID for polling progress

		return NextResponse.json({
			success: true,
			scanId: '',
		})
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error'
		return NextResponse.json({ error: message }, { status: 500 })
	}
}
