import { type NextRequest, NextResponse } from 'next/server'
import { processGmailPushNotification } from '@/features/gmail/services/gmail-watch.service'

/**
 * POST /api/gmail/webhook
 * Pub/Sub push notification endpoint
 * Receives incoming email notifications from Gmail
 *
 * CRITICAL: Always return 200 OK to prevent Pub/Sub retries
 */

export async function POST(request: NextRequest) {
	try {
		const pushMessage = await request.json()

		// Process notification (async, don't await)
		processGmailPushNotification(pushMessage).catch((error) => {
			console.error('Failed to process Gmail notification:', error)
		})

		// Always return 200 OK immediately to prevent Pub/Sub retry flood
		return NextResponse.json({ success: true })
	} catch (error) {
		// Even on parse error, return 200 to prevent retries
		console.error('Webhook error:', error)
		return NextResponse.json({ success: true })
	}
}
