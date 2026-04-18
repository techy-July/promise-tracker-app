'use client'

import { useState, useTransition } from 'react'
import { Modal } from '@/components/ui/Modal'
import { createItemAndRefresh } from '@/features/items/controllers/item.controller'
import type { Database } from '@/lib/database.types'

type Category = Database['public']['Tables']['categories']['Row']

interface AddItemModalProps {
	categories: Category[]
	onSuccess?: () => void
}

export function AddItemModal({ categories, onSuccess }: AddItemModalProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [isPending, startTransition] = useTransition()
	const [error, setError] = useState('')
	const [success, setSuccess] = useState(false)

	// Form state
	const [title, setTitle] = useState('')
	const [dueDate, setDueDate] = useState('')
	const [priority, setPriority] = useState('1')
	const [categoryId, setCategoryId] = useState('')

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')
		setSuccess(false)

		if (!title.trim()) {
			setError('Title is required')
			return
		}

		startTransition(async () => {
			try {
				const result = await createItemAndRefresh({
					title: title.trim(),
					due_date: dueDate || null,
					priority: Number.parseInt(priority, 10),
					category_id: categoryId || null,
					status: 'pending',
				} as any)

				if (!result.success) {
					setError(result.error || 'Failed to create item')
					return
				}

				setSuccess(true)
				resetForm()

				// Close modal after 1 second
				setTimeout(() => {
					setIsOpen(false)
					onSuccess?.()
				}, 800)
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Unknown error')
			}
		})
	}

	const resetForm = () => {
		setTitle('')
		setDueDate('')
		setPriority('1')
		setCategoryId('')
		setError('')
		setSuccess(false)
	}

	const handleClose = () => {
		resetForm()
		setIsOpen(false)
	}

	return (
		<>
			{/* Add Item Button - Top Right */}
			<button
				type="button"
				onClick={() => setIsOpen(true)}
				className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
			>
				+ Add Item
			</button>

			{/* Modal */}
			<Modal isOpen={isOpen} onClose={handleClose} title="Add New Item" maxWidth="md">
				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Error Message */}
					{error && (
						<div className="bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100 p-3 rounded text-sm">
							{error}
						</div>
					)}

					{/* Success Message */}
					{success && (
						<div className="bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100 p-3 rounded text-sm">
							Item created successfully!
						</div>
					)}

					{/* Title */}
					<div>
						<label
							htmlFor="title"
							className="block text-sm font-medium text-black dark:text-white mb-1"
						>
							Title *
						</label>
						<input
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="What's the promise?"
							className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
							disabled={isPending}
						/>
					</div>

					{/* Due Date */}
					<div>
						<label
							htmlFor="dueDate"
							className="block text-sm font-medium text-black dark:text-white mb-1"
						>
							Due Date
						</label>
						<input
							type="date"
							value={dueDate}
							onChange={(e) => setDueDate(e.target.value)}
							className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
							disabled={isPending}
						/>
					</div>

					{/* Priority */}
					<div>
						<label
							htmlFor="priority"
							className="block text-sm font-medium text-black dark:text-white mb-1"
						>
							Priority
						</label>
						<select
							value={priority}
							onChange={(e) => setPriority(e.target.value)}
							className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
							disabled={isPending}
						>
							<option value="1">High</option>
							<option value="2">Medium</option>
							<option value="3">Low</option>
						</select>
					</div>

					{/* Category */}
					<div>
						<label
							htmlFor="category"
							className="block text-sm font-medium text-black dark:text-white mb-1"
						>
							Category
						</label>
						<select
							value={categoryId}
							onChange={(e) => setCategoryId(e.target.value)}
							className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
							disabled={isPending}
						>
							<option value="">Select a category</option>
							{categories.map((cat) => (
								<option key={cat.id} value={cat.id}>
									{cat.name}
								</option>
							))}
						</select>
					</div>

					{/* Form Actions */}
					<div className="flex gap-2 pt-4">
						<button
							type="button"
							onClick={handleClose}
							disabled={isPending}
							className="flex-1 px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isPending}
							className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 text-white rounded-lg font-medium transition-colors"
						>
							{isPending ? 'Creating...' : 'Add Item'}
						</button>
					</div>
				</form>
			</Modal>
		</>
	)
}
