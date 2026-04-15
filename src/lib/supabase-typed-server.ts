import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

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
export async function createTypedServerClient() {
	const cookieStore = await cookies();

	return createServerClient<Database>(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return cookieStore.getAll();
				},
				setAll(
					cookiesToSet: {
						name: string;
						value: string;
						options: CookieOptions;
					}[],
				) {
					try {
						cookiesToSet.forEach(({ name, value, options }) =>
							cookieStore.set(name, value, options),
						);
					} catch {
						// The `setAll` method was called from a Server Component.
						// This can be ignored if you have middleware refreshing
						// user sessions.
					}
				},
			},
		},
	);
}
