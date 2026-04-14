'use client'

import LogOutButton from '@/components/LogOutButton'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { toast } from 'sonner'

export default function Dashboard() {
  const router = useRouter()
  const supabase = createClient()
  // User data from authenticated session
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch current user on component mount
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      // Extract user data or set to null if no session
      setUser(session?.user || null)
      setLoading(false)
    }

    getUser()
  }, [supabase.auth])

  // Redirect unauthenticated users back to login
  useEffect(() => {
    if (!loading && !user) {
      toast.error('Unauthorized', {
        description: 'Please log in to access the dashboard.',
      })
      router.push('/log-in')
    }
  }, [user, loading, router])

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black">
      <nav className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-3xl mx-auto px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-black dark:text-white">
            Dashboard
          </h2>
          <LogOutButton />
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-8 w-full">
        <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
          <h1 className="text-2xl font-bold mb-4 text-black dark:text-white">
            Welcome
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Your dashboard is ready to use. Add your promise tracker features here!
          </p>
        </div>
      </main>
    </div>
  )
}
