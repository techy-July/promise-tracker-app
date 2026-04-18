'use server'

import { createTypedServerClient } from '@/lib/supabase-typed-server'
import type { Database } from '@/lib/database.types'

type TrackableItem = Database['public']['Tables']['trackable_items']['Row']
type TrackableItemInsert = Database['public']['Tables']['trackable_items']['Insert']
type TrackableItemUpdate = Database['public']['Tables']['trackable_items']['Update']

/**
 * Item Service - handles all database queries for trackable items
 * No business logic, just DB operations
 */

export async function createItemInDatabase(
	userId: string,
	item: TrackableItemInsert
): Promise<TrackableItem> {
	const supabase = await createTypedServerClient()

	const { data, error } = await supabase
		.from('trackable_items')
		.insert([
			{
				...item,
				user_id: userId,
			},
		])
		.select()
		.single()

	if (error) throw new Error(`Failed to create item: ${error.message}`)
	return data
}

export async function getItemById(userId: string, itemId: string): Promise<TrackableItem | null> {
	const supabase = await createTypedServerClient()

	const { data, error } = await supabase
		.from('trackable_items')
		.select('*')
		.eq('user_id', userId)
		.eq('id', itemId)
		.single()

	if (error && error.code !== 'PGRST116') {
		// PGRST116 = no rows found
		throw new Error(`Failed to fetch item: ${error.message}`)
	}

	return data || null
}

export async function getUserItems(userId: string): Promise<TrackableItem[]> {
	const supabase = await createTypedServerClient()

	const { data, error } = await supabase
		.from('trackable_items')
		.select('*')
		.eq('user_id', userId)
		.order('created_at', { ascending: false })

	if (error) throw new Error(`Failed to fetch items: ${error.message}`)
	return data || []
}

export async function updateItemInDatabase(
	userId: string,
	itemId: string,
	updates: TrackableItemUpdate
): Promise<TrackableItem> {
	const supabase = await createTypedServerClient()

	const { data, error } = await supabase
		.from('trackable_items')
		.update(updates)
		.eq('user_id', userId)
		.eq('id', itemId)
		.select()
		.single()

	if (error) throw new Error(`Failed to update item: ${error.message}`)
	return data
}

export async function deleteItemFromDatabase(userId: string, itemId: string): Promise<void> {
	const supabase = await createTypedServerClient()

	const { error } = await supabase
		.from('trackable_items')
		.delete()
		.eq('user_id', userId)
		.eq('id', itemId)

	if (error) throw new Error(`Failed to delete item: ${error.message}`)
}

export async function getItemsByCategory(
	userId: string,
	categoryId: string
): Promise<TrackableItem[]> {
	const supabase = await createTypedServerClient()

	const { data, error } = await supabase
		.from('trackable_items')
		.select('*')
		.eq('user_id', userId)
		.eq('category_id', categoryId)
		.order('created_at', { ascending: false })

	if (error) throw new Error(`Failed to fetch items by category: ${error.message}`)
	return data || []
}

export async function getOverdueItems(userId: string): Promise<TrackableItem[]> {
	const supabase = await createTypedServerClient()

	const now = new Date().toISOString()
	const { data, error } = await supabase
		.from('trackable_items')
		.select('*')
		.eq('user_id', userId)
		.eq('status', 'pending')
		.lt('due_date', now)
		.order('due_date', { ascending: true })

	if (error) throw new Error(`Failed to fetch overdue items: ${error.message}`)
	return data || []
}

export async function getAwaitingReplyItems(userId: string): Promise<TrackableItem[]> {
	const supabase = await createTypedServerClient()

	// Query join with reply_tracking table to find items awaiting replies
	const { data, error } = await supabase
		.from('trackable_items')
		.select(
			`
      *,
      reply_tracking:reply_tracking(awaited_reply)
    `
		)
		.eq('user_id', userId)
		.eq('status', 'pending')
		.eq('reply_tracking.awaited_reply', true)
		.order('created_at', { ascending: false })

	if (error) throw new Error(`Failed to fetch awaiting-reply items: ${error.message}`)
	return data || []
}
