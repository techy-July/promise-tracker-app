import { type NextRequest, NextResponse } from 'next/server'
import { createTypedServerClient } from '@/lib/supabase-typed-server'

/**
 * GET /api/gmail/auth/callback
 * OAuth callback redirect from Gmail
 * Exchanges auth code for tokens and stores them
 */

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const code = searchParams.get('code')
		const state = searchParams.get('state')

		if (!code || !state) {
			return NextResponse.json({ error: 'Missing authorization code or state' }, { status: 400 })
		}

		const supabase = await createTypedServerClient()

		// TODO: Exchange code for tokens
		// TODO: Verify state matches session
		// TODO: Store token in user_oauth_tokens
		// TODO: Setup Gmail watch
		// TODO: Redirect to dashboard

		return NextResponse.json({ success: true })
	} catch (error) {
		const message = error instanceof Error ? error.message : 'OAuth callback error'
		return NextResponse.json({ error: message }, { status: 500 })
	}
}
