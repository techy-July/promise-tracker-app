import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

/**
 * Creates a type-safe Supabase client for use in browser/client components
 * Provides full TypeScript support for all tables, views, and functions
 *
 * Usage in client components:
 * ```tsx
 * const supabase = createTypedBrowserClient()
 * const { data, error } = await supabase
 *   .from('yourTable')
 *   .select('*')
 * ```
 */
export function createTypedBrowserClient() {
	return createBrowserClient<Database>(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
	);
}
