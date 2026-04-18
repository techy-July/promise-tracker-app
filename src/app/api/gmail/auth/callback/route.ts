import { type NextRequest, NextResponse } from 'next/server'
import { createTypedServerClient } from '@/lib/supabase-typed-server'
import {
	exchangeCodeForTokens,
	storeGmailToken,
} from '@/features/gmail/services/gmail-auth.service'
import { setupGmailWatch } from '@/features/gmail/services/gmail-watch.service'

/**
 * GET /api/gmail/auth/callback
 * OAuth callback redirect from Gmail
 * Exchanges auth code for tokens, stores them, and sets up Gmail watch
 */

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const code = searchParams.get('code')
		const state = searchParams.get('state')
		const redirect = searchParams.get('redirect') || 'dashboard' // 'extension' or 'dashboard'

		if (!code || !state) {
			return NextResponse.json({ error: 'Missing authorization code or state' }, { status: 400 })
		}

		const supabase = await createTypedServerClient()

		// Verify state matches session (prevents CSRF)
		// For now, we'll accept any state and rely on OAuth provider validation
		// In production, verify state against session storage

		// Get current user
		const {
			data: { user },
		} = await supabase.auth.getUser()

		if (!user) {
			// Redirect to sign-up if not authenticated
			const signUpUrl = new URL(request.url)
			signUpUrl.pathname = '/sign-up'
			signUpUrl.search = '?error=please_sign_up'
			return NextResponse.redirect(signUpUrl)
		}

		// Exchange code for tokens
		const tokenData = await exchangeCodeForTokens(code)

		// Store tokens in database
		await storeGmailToken(user.id, tokenData)

		// Setup Gmail watch for push notifications
		try {
			await setupGmailWatch(user.id)
		} catch (err) {
			console.error('Failed to setup Gmail watch:', err)
			// Continue anyway - watch setup is not critical for initial auth
		}

		// Redirect back to appropriate destination
		const redirectUrl = new URL(request.url)
		if (redirect === 'extension') {
			// For extension: return success page that extension can detect
			redirectUrl.pathname = '/auth/success'
			redirectUrl.search = '?type=extension&code=oauth_complete'
		} else {
			// For web: redirect to dashboard
			redirectUrl.pathname = '/dashboard'
			redirectUrl.search = '?gmail_connected=true'
		}

		return NextResponse.redirect(redirectUrl)
	} catch (error) {
		const message = error instanceof Error ? error.message : 'OAuth callback error'
		console.error('OAuth callback error:', message)

		// Redirect to error page
		const errorUrl = new URL(request.url)
		errorUrl.pathname = '/auth/error'
		errorUrl.searchParams.set('error', message)

		return NextResponse.redirect(errorUrl)
	}
}
