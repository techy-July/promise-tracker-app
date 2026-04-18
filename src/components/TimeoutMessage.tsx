'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function TimeoutMessage() {
	const searchParams = useSearchParams()
	const timedOut = searchParams.get('reason') === 'timeout'

	if (!timedOut) return null

	return (
		<div className="mb-6 p-4 bg-amber-100 dark:bg-amber-900 border border-amber-300 dark:border-amber-700 rounded text-amber-800 dark:text-amber-100 text-sm">
			<p className="font-semibold">Session Expired</p>
			<p className="mt-1">Your session was inactive for too long. Please log in again.</p>
		</div>
	)
}

export function TimeoutMessageWithSuspense() {
	return (
		<Suspense fallback={null}>
			<TimeoutMessage />
		</Suspense>
	)
}
