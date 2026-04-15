'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

export default function LogOutButton() {
	const router = useRouter()
	const supabase = createClient()

	const handleLogOut = async () => {
		await supabase.auth.signOut()
		router.push('/log-in')
	}

	return (
		<button
			type="button"
			onClick={handleLogOut}
			className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"
		>
			<LogOut size={18} />
			Log Out
		</button>
	)
}
