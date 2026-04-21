import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

/**
 * Creates a type-safe Supabase client for use in browser/client components
 * Provides full TypeScript support for all tables, views, and functions
 */
export function createTypedBrowserClient() {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

	if (!supabaseUrl || !supabaseAnonKey) {
		throw new Error('Missing Supabase environment variables.')
	}
	return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}
