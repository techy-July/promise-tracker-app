import type { CookieOptions } from '@supabase/ssr'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Type definition for auth cookies with secure options
interface AuthCookie {
	name: string
	value: string
	options: CookieOptions // httpOnly, secure, sameSite, etc.
}

/**
 * Server-side Supabase client for Route Handlers and Server Components
 * Server components need a server-specific instance that can read/write
 * HTTP-only cookies for secure session storage without exposing to JavaScript
 */
export async function createClient() {
	// Get Next.js cookie store to manage auth sessions
	const cookieStore = await cookies()

	return createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			// Custom cookie handlers for Supabase session management
			cookies: {
				getAll() {
					return cookieStore.getAll()
				},
				setAll(cookiesToSet: AuthCookie[]) {
					cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
				},
			},
		}
	)
}
