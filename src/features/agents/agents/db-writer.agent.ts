'use server'

import type { AgentResult } from '../models/agent-result.model'
import type { EmailPayload } from '../models/email-payload.model'
import type { TrackedItem } from './reply-tracker.agent'
import { createTypedServerClient } from '@/lib/supabase-typed-server'
import type { Database } from '@/lib/database.types'

/**
 * Database Writer Agent
 * Persists extracted items and reply tracking to database
 * Final step in pipeline - commits all changes
 */

export interface DbWriteResult {
	itemsCreated: string[] // array of created item IDs
	replyTrackingCreated: string[] // array of created reply_tracking IDs
}

export async function dbWriterAgent(
	emailPayload: EmailPayload,
	items: TrackedItem[]
): Promise<AgentResult<DbWriteResult>> {
	try {
		const supabase = await createTypedServerClient()

		const itemIds: string[] = []
		const replyTrackingIds: string[] = []

		// Insert items into trackable_items table
		for (const item of items) {
			const itemInsert: Database['public']['Tables']['trackable_items']['Insert'] = {
				title: item.title,
				description: item.description,
				due_date: item.dueDate || null,
				priority: mapPriority(item.priority),
				category_id: item.category_id || null,
				status: 'pending',
				auto_extracted: true,
				user_id: '', // TODO: Get from auth context
			}

			const { data: createdItem, error: itemError } = await supabase
				.from('trackable_items')
				.insert([itemInsert])
				.select('id')
				.single()

			if (itemError) throw new Error(`Failed to create item: ${itemError.message}`)
			if (createdItem) itemIds.push(createdItem.id)

			// If item awaits reply, create reply_tracking entry
			if (item.awaited_reply && createdItem) {
				const replyInsert: Database['public']['Tables']['reply_tracking']['Insert'] = {
					item_id: createdItem.id,
					awaiting_reply: true,
					platform: 'email',
					external_thread_id: item.reply_channel_id || null,
				}

				const { data: replyTracking, error: replyError } = await supabase
					.from('reply_tracking')
					.insert([replyInsert])
					.select('id')
					.single()

				if (replyError) throw new Error(`Failed to create reply tracking: ${replyError.message}`)
				if (replyTracking) replyTrackingIds.push(replyTracking.id)
			}
		}

		return {
			success: true,
			data: {
				itemsCreated: itemIds,
				replyTrackingCreated: replyTrackingIds,
			},
			skipped: false,
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Database write error'
		return {
			success: false,
			data: null,
			skipped: false,
			reason: message,
		}
	}
}

/**
 * Map priority string to numeric value for database
 * TODO: Verify this matches your database priority enum/values
 */
function mapPriority(priority: 'high' | 'medium' | 'low'): number {
	const map = {
		high: 1,
		medium: 2,
		low: 3,
	}
	return map[priority]
}
