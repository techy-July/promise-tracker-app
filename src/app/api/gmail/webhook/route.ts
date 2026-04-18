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
		const verificationToken = request.headers.get('x-goog-pubsub-verification-token') || undefined

		// Process notification (async, don't await)
		// Process in background to avoid response timeout
		processGmailPushNotification(pushMessage, verificationToken).catch((error) => {
			console.error('Failed to process Gmail notification:', error)
		})

		// Always return 200 OK immediately to prevent Pub/Sub retry flood
		return NextResponse.json({ success: true })
	} catch (error) {
		// Even on parse error, return 200 to prevent retries
		console.error('Webhook parse error:', error)
		return NextResponse.json({ success: true })
	}
}
