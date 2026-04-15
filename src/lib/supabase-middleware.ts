import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

/**
 * Middleware for session management and route protection
 * Runs on every request to:
 * 1. Refresh expired access tokens using refresh tokens
 * 2. Protect routes by checking authentication
 * 3. Keep users logged in seamlessly
 */
export async function updateSession(request: NextRequest) {
	// Create a response object to potentially update cookies
	const supabaseResponse = NextResponse.next({
		request,
	})

	// Create Supabase client that can read request cookies and write response cookies
	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
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
		}
	)

	// getUser():
	// 1. Reads the current access token from cookies
	// 2. If expired, automatically uses refresh token to get new one
	// 3. Returns user data if valid session exists
	const {
		data: { user },
	} = await supabase.auth.getUser()

	// Protect /dashboard route from unauthorized access
	const pathname = request.nextUrl.pathname
	if (pathname.startsWith('/dashboard') && !user) {
		// Redirect unauthenticated users to login
		return NextResponse.redirect(new URL('/log-in', request.url))
	}

	return { supabaseResponse, user }
}
