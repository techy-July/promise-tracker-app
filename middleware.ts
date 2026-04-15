import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase-middleware'

/**
 * Next.js Middleware - runs on every request
 * Central place to:
 * 1. Refresh expired sessions automatically
 * 2. Check if user has permission to access route
 * 3. Redirect unauthorized users to login
 */
export async function middleware(request: NextRequest) {
	const result = await updateSession(request)

	if (result instanceof NextResponse) {
		return result
	}

	return result.supabaseResponse
}

export const config = {
	// This regex matches all paths EXCEPT static assets
	// We want to protect normal routes but not images/CSS/JS files
	matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)'],
}
