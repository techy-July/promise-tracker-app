import { type NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/reminders/dispatch
 * Sends reminder emails to users
 * Called by scheduled job (Supabase Edge Functions or external service)
 */

export async function POST(request: NextRequest) {
	try {
		// TODO: Fetch pending reminders from database
		// TODO: For each reminder:
		//   - Generate email content
		//   - Send email
		//   - Mark as sent in database
		// TODO: Handle failures gracefully (retry, log)

		return NextResponse.json({
			success: true,
			remindersSent: 0,
		})
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error'
		return NextResponse.json({ error: message }, { status: 500 })
	}
}
