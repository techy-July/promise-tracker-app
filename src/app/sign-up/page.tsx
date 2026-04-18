'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import type { Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase-client'

export default function SignUp() {
	const router = useRouter()
	const [_isPending, startTransition] = useTransition()
	const supabase = createClient()
	const [session, setSession] = useState<Session | null>(null)
	const [loading, setLoading] = useState(true)
	const [isMounted, setIsMounted] = useState(false)

	useEffect(() => {
		setIsMounted(true)
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			return setSession(session)
		})

		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session)
			setLoading(false)
		})

		return () => subscription.unsubscribe()
	}, [supabase.auth])

	useEffect(() => {
		if (isMounted && session && !loading) {
			startTransition(() => {
				router.push('/dashboard')
			})
		}
	}, [session, loading, isMounted, router])

	return (
		<div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
			<div className="w-full max-w-md p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-lg">
				<h1 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">
					Create Account
				</h1>
				<Auth
					supabaseClient={supabase}
					view="sign_up"
					appearance={{ theme: ThemeSupa }}
					theme="dark"
					providers={['google']}
					redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/callback`}
				/>
			</div>
		</div>
	)
}
