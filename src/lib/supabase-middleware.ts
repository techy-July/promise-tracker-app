import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

/**
 * Session inactivity timeout in milliseconds
 * 30 minutes (1800000 ms) - adjust as needed
 */
const SESSION_TIMEOUT = 30 * 60 * 1000

/**
 * Middleware for session management and route protection
 * Runs on every request to:
 * 1. Refresh expired access tokens using refresh tokens
 * 2. Protect routes by checking authentication
 * 3. Keep users logged in seamlessly
 * 4. Enforce session inactivity timeout
 */
export async function updateSession(request: NextRequest) {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

	if (!supabaseUrl || !supabaseAnonKey) {
		throw new Error('Missing Supabase environment variables.')
	}

	// Create a response object to potentially update cookies
	const supabaseResponse = NextResponse.next({
		request,
	})

	// Create Supabase client that can read request cookies and write response cookies
	const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
		cookies: {
			getAll() {
				return request.cookies.getAll()
			},
			setAll(cookiesToSet: { name: any; value: any; options: any }[]) {
				cookiesToSet.forEach(({ name, value, options }) =>
					supabaseResponse.cookies.set(name, value, options)
				)
			},
		},
	})

	// getUser():
	// 1. Reads the current access token from cookies
	// 2. If expired, automatically uses refresh token to get new one
	// 3. Returns user data if valid session exists
	const {
		data: { user },
	} = await supabase.auth.getUser()

	// Check session inactivity timeout
	const lastActivity = request.cookies.get('last_activity')?.value
	const now = Date.now()

	if (user && lastActivity) {
		const lastActivityTime = Number.parseInt(lastActivity, 10)
		const timeSinceLastActivity = now - lastActivityTime

		// If user has been inactive longer than SESSION_TIMEOUT, clear session
		if (timeSinceLastActivity > SESSION_TIMEOUT) {
			// Sign out the user
			await supabase.auth.signOut()

			// Redirect to login with timeout message
			const loginUrl = new URL('/log-in', request.url)
			loginUrl.searchParams.set('reason', 'timeout')
			const response = NextResponse.redirect(loginUrl)

			// Clear the last_activity cookie
			response.cookies.delete('last_activity')
			return { supabaseResponse: response, user: null }
		}
	}

	// Protect /dashboard route from unauthorized access
	const pathname = request.nextUrl.pathname
	if (pathname.startsWith('/dashboard') && !user) {
		// Redirect unauthenticated users to login
		return NextResponse.redirect(new URL('/log-in', request.url))
	}

	return { supabaseResponse, user }
}
