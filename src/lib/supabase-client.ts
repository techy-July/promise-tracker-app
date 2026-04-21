import { createBrowserClient } from '@supabase/ssr'

/**
 * Browser-safe Supabase client for client components
 * Client components run in the browser and need a client-specific instance
 * that handles browser APIs like localStorage for session persistence
 */
export function createClient() {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

	if (!supabaseUrl || !supabaseAnonKey) {
		throw new Error('Missing Supabase environment variables.')
	}

	return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
