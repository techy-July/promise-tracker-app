import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

/**
 * OAuth Callback Handler
 * OAuth providers (Google, GitHub) redirect here after user authentication
 * This exchanges the temporary authorization code for a real session
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  // If authorization code exists, exchange it for a session
  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to dashboard after successful authentication
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
