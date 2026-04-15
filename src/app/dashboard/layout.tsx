'use client'

import type { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import Sidebar from '@/components/Sidebar'
import { createClient } from '@/lib/supabase-client'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	const router = useRouter()
	const supabase = createClient()
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)

	// Fetch current user on component mount
	useEffect(() => {
		const getUser = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession()
			setUser(session?.user || null)
			setLoading(false)
		}

		getUser()
	}, [supabase.auth])

	// Redirect unauthenticated users to login
	useEffect(() => {
		if (!loading && !user) {
			toast.error('Unauthorized', {
				description: 'Please log in to access the dashboard.',
			})
			router.push('/log-in')
		}
	}, [user, loading, router])

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto" />
					<p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading...</p>
				</div>
			</div>
		)
	}

	if (!user) {
		return null
	}

	return (
		<div className="flex min-h-screen bg-zinc-50 dark:bg-black">
			{/* Sidebar */}
			<Sidebar />

			{/* Main content */}
			<main className="flex-1 md:ml-64">
				{/* Header */}
				<header className="sticky top-0 z-10 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
					<div className="px-6 py-4 md:ml-0">
						<div className="flex items-center justify-between">
							<div className="hidden md:block">
								<p className="text-sm text-zinc-500 dark:text-zinc-400">Welcome back,</p>
								<p className="text-lg font-semibold text-black dark:text-white">{user.email}</p>
							</div>
							<div className="text-right">
								<p className="text-xs text-zinc-500 dark:text-zinc-400">
									{new Date().toLocaleDateString('en-US', {
										weekday: 'long',
										month: 'short',
										day: 'numeric',
									})}
								</p>
							</div>
						</div>
					</div>
				</header>

				{/* Content area */}
				<div className="p-6 md:p-8">{children}</div>
			</main>
		</div>
	)
}
