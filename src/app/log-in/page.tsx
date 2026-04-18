'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import type { Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { TimeoutMessageWithSuspense } from '@/components/ui/TimeoutMessage'

export default function LogIn() {
	const router = useRouter()
	const supabase = createClient()
	// Store session state - null means logged out, Session object means logged in
	const [session, setSession] = useState<Session | null>(null)
	const [loading, setLoading] = useState(true)

	// Setup session listener and check current session
	useEffect(() => {
		// Listen for auth state changes (login, logout, token refresh)
		// Why: Automatically update UI when auth state changes (e.g., from OAuth redirect)
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session)
		})

		// Check if user already has a valid session (e.g., from cookies)
		// Why: If they're already logged in, we don't want them on login page
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session)
			setLoading(false)
		})

		// Cleanup: unsubscribe from auth changes when component unmounts
		// Why: Prevents memory leaks and multiple listeners
		return () => subscription.unsubscribe()
	}, [supabase.auth])

	// Redirect to dashboard if already logged in
	useEffect(() => {
		if (session && !loading) {
			// Why: No point showing login page to logged-in users
			router.push('/dashboard')
		}
	}, [session, router, loading])

	return (
		<div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
			<div className="w-full max-w-md p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-lg">
				<h1 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">Log In</h1>

				{/* Session timeout message */}
				<TimeoutMessageWithSuspense />
				<Auth
					supabaseClient={supabase}
					view="sign_in"
					appearance={{ theme: ThemeSupa }}
					theme="dark"
					providers={[]}
					redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/callback`}
				/>
			</div>
		</div>
	)
}
