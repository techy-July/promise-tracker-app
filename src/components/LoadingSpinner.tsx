'use client'

import { Loader } from 'lucide-react'

export default function LoadingSpinner() {
	return (
		<div className="flex items-center justify-center py-8">
			<Loader className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin" />
		</div>
	)
}
