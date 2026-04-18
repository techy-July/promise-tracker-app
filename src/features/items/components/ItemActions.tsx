'use client'

import { useState, useTransition } from 'react'
import { Check, Trash2, Calendar } from 'lucide-react'
import { markItemDone, deleteItemOptimized, updateItemDueDate } from '@/lib/actions/items'
import type { Database } from '@/lib/database.types'

type TrackableItem = Database['public']['Tables']['trackable_items']['Row']

interface ItemActionsProps {
	item: TrackableItem
	onActionComplete?: () => void
}

export function ItemActions({ item, onActionComplete }: ItemActionsProps) {
	const [isPending, startTransition] = useTransition()
	const [showDatePicker, setShowDatePicker] = useState(false)
	const [pendingAction, setPendingAction] = useState<string | null>(null)
	const [error, setError] = useState('')
	const [optimisticStatus, setOptimisticStatus] = useState<string | null>(null)

	const handleMarkDone = () => {
		setError('')
		setPendingAction('markDone')
		// Optimistic update
		setOptimisticStatus('done')

		startTransition(async () => {
			const result = await markItemDone(item.id)
			if (!result.success) {
				setError(result.error || 'Failed to mark item done')
				setOptimisticStatus(null)
			}
			setPendingAction(null)
			onActionComplete?.()
		})
	}

	const handleDelete = () => {
		if (!confirm('Are you sure you want to delete this item?')) return

		setError('')
		setPendingAction('delete')

		startTransition(async () => {
			const result = await deleteItemOptimized(item.id)
			if (!result.success) {
				setError(result.error || 'Failed to delete item')
				setPendingAction(null)
			}
			onActionComplete?.()
		})
	}

	const handleDueDateChange = (newDate: string) => {
		setError('')
		setPendingAction('updateDueDate')

		startTransition(async () => {
			const result = await updateItemDueDate(item.id, newDate || null)
			if (!result.success) {
				setError(result.error || 'Failed to update due date')
			}
			setPendingAction(null)
			setShowDatePicker(false)
			onActionComplete?.()
		})
	}

	const currentStatus = optimisticStatus || item.status

	return (
		<>
			{error && (
				<div className="mb-2 p-2 bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100 text-xs rounded">
					{error}
				</div>
			)}

			<div className="flex items-center gap-2">
				{/* Mark Done Button */}
				<button
					type="button"
					onClick={handleMarkDone}
					disabled={isPending || currentStatus === 'done'}
					title="Mark as done"
					className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:bg-green-100 dark:hover:bg-green-900 hover:text-green-700 dark:hover:text-green-300 rounded disabled:opacity-50 transition-colors"
					aria-label="Mark as done"
				>
					<Check className="w-4 h-4" />
				</button>

				{/* Quick Edit Due Date */}
				<div className="relative">
					<button
						type="button"
						onClick={() => setShowDatePicker(!showDatePicker)}
						disabled={isPending}
						title="Edit due date"
						className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 rounded disabled:opacity-50 transition-colors"
						aria-label="Edit due date"
					>
						<Calendar className="w-4 h-4" />
					</button>

					{showDatePicker && (
						<div className="absolute top-full left-0 mt-1 z-10 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded shadow-lg p-2">
							<input
								type="date"
								value={item.due_date || ''}
								onChange={(e) => handleDueDateChange(e.target.value)}
								disabled={isPending}
								className="px-2 py-1 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-black dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
							<button
								type="button"
								onClick={() => setShowDatePicker(false)}
								className="mt-1 w-full px-2 py-1 text-xs bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-black dark:text-white rounded"
							>
								Close
							</button>
						</div>
					)}
				</div>

				{/* Delete Button */}
				<button
					type="button"
					onClick={handleDelete}
					disabled={isPending}
					title="Delete item"
					className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-700 dark:hover:text-red-300 rounded disabled:opacity-50 transition-colors"
					aria-label="Delete item"
				>
					<Trash2 className="w-4 h-4" />
				</button>
			</div>

			{/* Loading indicator */}
			{isPending && (
				<div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Updating...</div>
			)}
		</>
	)
}
