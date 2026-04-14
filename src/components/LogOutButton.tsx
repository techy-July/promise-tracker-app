'use client'

import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function LogOutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogOut = async () => {
    await supabase.auth.signOut()
    router.push('/log-in')
  }

  return (
    <button
      onClick={handleLogOut}
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
    >
      <LogOut size={18} />
      Log Out
    </button>
  )
}
