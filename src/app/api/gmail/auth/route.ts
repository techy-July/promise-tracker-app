import { type NextRequest, NextResponse } from 'next/server'
import { createTypedServerClient } from '@/lib/supabase-typed-server'
import { getAuthorizationUrl } from '@/features/gmail/services/gmail-auth.service'

/**
 * GET /api/gmail/auth
 * Initiates Gmail OAuth flow
 * Redirects user to Google consent screen
 */

export async function GET(request: NextRequest) {
	try {
		const supabase = await createTypedServerClient()

		// Verify user is authenticated
		const {
			data: { user },
		} = await supabase.auth.getUser()

		if (!user) {
			// Redirect to sign-up if not authenticated
			const signUpUrl = new URL(request.url)
			signUpUrl.pathname = '/sign-up'
			signUpUrl.search = '?error=sign_in_required'
			return NextResponse.redirect(signUpUrl)
		}

		// Generate random state for CSRF protection
		const state = Math.random().toString(36).substring(7)

		// Store state in session (in production, use proper session storage)
		const authUrl = await getAuthorizationUrl(state)

		return NextResponse.redirect(authUrl)
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to initiate Gmail auth'
		console.error('Gmail auth error:', message)

		return NextResponse.json({ error: message }, { status: 500 })
	}
}
