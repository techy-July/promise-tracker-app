import { type CookieOptions, createServerClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

/**
 * Creates a type-safe Supabase client for use in Server Components and Route Handlers
 * Handles secure cookie management and server-side authentication
 *
 * Usage in Server Components:
 * ```tsx
 * const supabase = await createTypedServerClient()
 * const { data, error } = await supabase
 *   .from('yourTable')
 *   .select('*')
 * ```
 *
 * Usage in Route Handlers:
 * ```tsx
 * export async function GET() {
 *   const supabase = await createTypedServerClient()
 *   // Query database with full type safety
 * }
 * ```
 */
export async function createTypedServerClient(): Promise<SupabaseClient<Database>> {
	const cookieStore = await cookies()

	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

	if (!supabaseUrl || !supabaseAnonKey) {
		throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
	}

	return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
		cookies: {
			getAll() {
				return cookieStore.getAll()
			},
			setAll(
				cookiesToSet: {
					name: string
					value: string
					options: CookieOptions
				}[]
			) {
				try {
					cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
				} catch {
					// The `setAll` method was called from a Server Component.
					// This can be ignored if you have middleware refreshing
					// user sessions.
				}
			},
		},
	}) as unknown as SupabaseClient<Database>
}
