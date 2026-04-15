'use client'

import { Activity, Plus } from 'lucide-react'

export default function DashboardPage() {
	return (
		<div className="max-w-6xl">
			{/* Page header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-black dark:text-white mb-2">Inbox</h1>
				<p className="text-zinc-600 dark:text-zinc-400">
					Track and manage your promises in one place
				</p>
			</div>

			{/* Quick stats */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
				<div className="bg-white dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-800">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Active Items</p>
							<p className="text-2xl font-bold text-black dark:text-white mt-2">12</p>
						</div>
						<Activity className="w-8 h-8 text-blue-600 dark:text-blue-400 opacity-50" />
					</div>
				</div>
				<div className="bg-white dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-800">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Awaiting Reply</p>
							<p className="text-2xl font-bold text-black dark:text-white mt-2">2</p>
						</div>
						<Activity className="w-8 h-8 text-amber-600 dark:text-amber-400 opacity-50" />
					</div>
				</div>
				<div className="bg-white dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-800">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
								Upcoming Reminders
							</p>
							<p className="text-2xl font-bold text-black dark:text-white mt-2">5</p>
						</div>
						<Activity className="w-8 h-8 text-green-600 dark:text-green-400 opacity-50" />
					</div>
				</div>
			</div>

			{/* Empty state / Placeholder */}
			<div className="bg-white dark:bg-zinc-900 rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-800 p-12 text-center">
				<Plus className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mx-auto mb-4" />
				<h2 className="text-xl font-semibold text-black dark:text-white mb-2">No items yet</h2>
				<p className="text-zinc-600 dark:text-zinc-400 mb-4">
					Start tracking promises by creating your first item
				</p>
				<button
					type="button"
					className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
				>
					Add Item
				</button>
			</div>
		</div>
	)
}
