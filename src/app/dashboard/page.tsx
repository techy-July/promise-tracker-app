import { getItemsController as getUserItems } from '@/features/items/controllers/item.controller'
import { getCategoriesController as getCategories } from '@/features/categories/controllers/category.controller'
import { AddItemModal } from '@/features/items/components/AddItemModal'
import { ItemRow } from '@/features/items/components/ItemRow'
import type { Database } from '@/lib/database.types'

type TrackableItem = Database['public']['Tables']['trackable_items']['Row']

interface GroupedItems {
	pending: TrackableItem[]
	overdue: TrackableItem[]
	done: TrackableItem[]
}

/**
 * Groups items by status
 * Status mapping: pending, overdue, done
 */
function groupItemsByStatus(items: TrackableItem[]): GroupedItems {
	const grouped: GroupedItems = {
		pending: [],
		overdue: [],
		done: [],
	}

	if (!items || items.length === 0) {
		return grouped
	}

	items.forEach((item) => {
		const status = item.status?.toLowerCase() || 'pending'

		if (status === 'done' || status === 'completed') {
			grouped.done.push(item)
		} else if (status === 'overdue') {
			grouped.overdue.push(item)
		} else {
			grouped.pending.push(item)
		}
	})

	return grouped
}

/**
 * Item List Component
 */
function ItemList({
	items,
	title,
	emptyMessage,
}: {
	items: TrackableItem[]
	title: string
	emptyMessage: string
}) {
	if (items.length === 0) {
		return (
			<div className="bg-white dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-800">
				<h2 className="text-lg font-semibold text-black dark:text-white mb-4">{title}</h2>
				<p className="text-zinc-600 dark:text-zinc-400 text-sm">{emptyMessage}</p>
			</div>
		)
	}

	return (
		<div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
			<div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
				<h2 className="text-lg font-semibold text-black dark:text-white">
					{title}{' '}
					<span className="text-zinc-500 dark:text-zinc-400 font-normal">({items.length})</span>
				</h2>
			</div>
			<ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
				{items.map((item) => (
					<ItemRow key={item.id} item={item} />
				))}
			</ul>
		</div>
	)
}

export default async function DashboardPage() {
	const { data: items, error } = await getUserItems()
	const { data: categories } = await getCategories()

	if (error) {
		return (
			<div className="max-w-6xl">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-black dark:text-white mb-2">Inbox</h1>
				</div>
				<div className="bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100 p-6 rounded-lg border border-red-300 dark:border-red-700">
					<p className="font-semibold">Error loading items</p>
					<p className="text-sm mt-1">{error}</p>
				</div>
			</div>
		)
	}

	// Group items by status
	const grouped = groupItemsByStatus(items || [])
	const totalItems = (items || []).length

	return (
		<div className="max-w-6xl">
			{/* Page header with Add Item button */}
			<div className="flex items-start justify-between gap-4 mb-8">
				<div>
					<h1 className="text-3xl font-bold text-black dark:text-white mb-2">Inbox</h1>
					<p className="text-zinc-600 dark:text-zinc-400">
						{totalItems} {totalItems === 1 ? 'item' : 'items'} to track
					</p>
				</div>
				<AddItemModal categories={categories || []} />
			</div>

			{/* Quick stats */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
				<div className="bg-white dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-800">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Pending</p>
							<p className="text-2xl font-bold text-black dark:text-white mt-2">
								{grouped.pending.length}
							</p>
						</div>
						<div className="text-3xl">🔵</div>
					</div>
				</div>
				<div className="bg-white dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-800">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Overdue</p>
							<p className="text-2xl font-bold text-black dark:text-white mt-2">
								{grouped.overdue.length}
							</p>
						</div>
						<div className="text-3xl">🔴</div>
					</div>
				</div>
				<div className="bg-white dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-800">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Done</p>
							<p className="text-2xl font-bold text-black dark:text-white mt-2">
								{grouped.done.length}
							</p>
						</div>
						<div className="text-3xl">✅</div>
					</div>
				</div>
			</div>

			{/* Items list sections */}
			<div className="space-y-6">
				<ItemList items={grouped.pending} title="Pending" emptyMessage="No pending items" />
				<ItemList items={grouped.overdue} title="Overdue" emptyMessage="No overdue items" />
				<ItemList items={grouped.done} title="Done" emptyMessage="No completed items" />
			</div>

			{/* Empty state if no items at all */}
			{totalItems === 0 && (
				<div className="bg-white dark:bg-zinc-900 rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-800 p-12 text-center">
					<h2 className="text-xl font-semibold text-black dark:text-white mb-2">No items yet</h2>
					<p className="text-zinc-600 dark:text-zinc-400">
						Start tracking promises by clicking the "Add Item" button above
					</p>
				</div>
			)}
		</div>
	)
}
