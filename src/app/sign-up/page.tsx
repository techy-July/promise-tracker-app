'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'

export default function SignUp() {
  const router = useRouter()
  const supabase = createClient()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
    if (session && !loading) {
      router.push('/dashboard')
    }
  }, [session, router, loading])

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
          providers={['github', 'google']}
          redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/callback`}
        />
      </div>
    </div>
  )
}
