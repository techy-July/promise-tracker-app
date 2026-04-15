import { createBrowserClient } from '@supabase/ssr'

/**
 * Browser-safe Supabase client for client components
 * Client components run in the browser and need a client-specific instance
 * that handles browser APIs like localStorage for session persistence
 */
export function createClient() {
	return createBrowserClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
	)
}
