'use client'

import { ItemActions } from './ItemActions'
import { formatDate, isOverdue } from '@/lib/item-helpers'
import type { Database } from '@/lib/database.types'

type TrackableItem = Database['public']['Tables']['trackable_items']['Row']

interface ItemRowProps {
	item: TrackableItem
}

export function ItemRow({ item }: ItemRowProps) {
	return (
		<li className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
			<div className="flex items-start justify-between gap-4">
				<div className="flex-1 min-w-0">
					<h3 className="font-semibold text-black dark:text-white truncate">{item.title}</h3>
					{item.description && (
						<p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
							{item.description}
						</p>
					)}
					<div className="flex items-center gap-3 mt-2 text-xs text-zinc-500 dark:text-zinc-400">
						{item.due_date && (
							<span>
								Due:{' '}
								<span
									className={
										isOverdue(item.due_date) ? 'text-red-600 dark:text-red-400 font-semibold' : ''
									}
								>
									{formatDate(item.due_date)}
								</span>
							</span>
						)}
						{item.priority && (
							<span>
								Priority:{' '}
								<span
									className={
										item.priority === 1
											? 'text-red-600 dark:text-red-400'
											: item.priority === 2
												? 'text-amber-600 dark:text-amber-400'
												: 'text-green-600 dark:text-green-400'
									}
								>
									{item.priority === 1 ? 'High' : item.priority === 2 ? 'Medium' : 'Low'}
								</span>
							</span>
						)}
						{item.category_id && (
							<span className="bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded">Category</span>
						)}
					</div>
					<div className="mt-3">
						<ItemActions item={item} />
					</div>
				</div>
				<div className="flex-shrink-0 text-xs text-zinc-500 dark:text-zinc-400 min-w-fit">
					{formatDate(item.created_at)}
				</div>
			</div>
		</li>
	)
}
