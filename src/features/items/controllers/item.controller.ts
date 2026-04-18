'use server'

import { revalidatePath } from 'next/cache'
import { createTypedServerClient } from '@/lib/supabase-typed-server'
import { validateTrackableItemDraft } from '../validators/item.validator'
import * as itemService from '../services/item.service'
import type { TrackableItem, TrackableItemUpdate } from '../models/item.model'

/**
 * Item Controller - orchestrates validators, services, and revalidation
 * Used by API route handlers
 */

export async function createItemController(itemDraft: unknown): Promise<{
	success: boolean
	data: TrackableItem | null
	error: string | null
}> {
	try {
		// Validate input
		const validated = validateTrackableItemDraft(itemDraft)

		// Get current user
		const supabase = await createTypedServerClient()
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser()

		if (userError || !user) throw new Error('Not authenticated')

		// Create item in database
		const data = await itemService.createItemInDatabase(user.id, {
			user_id: user.id,
			title: validated.title,
			description: validated.description,
			due_date: validated.due_date,
			confidence: validated.confidence,
			status: 'pending',
			auto_extracted: false,
		})

		// Revalidate affected routes
		revalidatePath('/dashboard')
		revalidatePath('/dashboard/categories')

		return { success: true, data, error: null }
	} catch (err) {
		const error = err instanceof Error ? err.message : 'Unknown error'
		return { success: false, data: null, error }
	}
}

export async function getItemsController(): Promise<{
	success: boolean
	data: TrackableItem[] | null
	error: string | null
}> {
	try {
		const supabase = await createTypedServerClient()
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser()

		if (userError || !user) throw new Error('Not authenticated')

		const data = await itemService.getUserItems(user.id)
		return { success: true, data, error: null }
	} catch (err) {
		const error = err instanceof Error ? err.message : 'Unknown error'
		return { success: false, data: null, error }
	}
}

export async function updateItemStatusController(
	itemId: string,
	status: 'pending' | 'completed' | 'cancelled'
): Promise<{
	success: boolean
	data: TrackableItem | null
	error: string | null
}> {
	try {
		const supabase = await createTypedServerClient()
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser()

		if (userError || !user) throw new Error('Not authenticated')

		const data = await itemService.updateItemInDatabase(user.id, itemId, { status })

		revalidatePath('/dashboard')
		return { success: true, data, error: null }
	} catch (err) {
		const error = err instanceof Error ? err.message : 'Unknown error'
		return { success: false, data: null, error }
	}
}

export async function updateItemController(
	itemId: string,
	updates: TrackableItemUpdate
): Promise<{
	success: boolean
	data: TrackableItem | null
	error: string | null
}> {
	try {
		const supabase = await createTypedServerClient()
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser()

		if (userError || !user) throw new Error('Not authenticated')

		const data = await itemService.updateItemInDatabase(user.id, itemId, updates)

		revalidatePath('/dashboard')
		return { success: true, data, error: null }
	} catch (err) {
		const error = err instanceof Error ? err.message : 'Unknown error'
		return { success: false, data: null, error }
	}
}

export async function deleteItemController(itemId: string): Promise<{
	success: boolean
	error: string | null
}> {
	try {
		const supabase = await createTypedServerClient()
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser()

		if (userError || !user) throw new Error('Not authenticated')

		await itemService.deleteItemFromDatabase(user.id, itemId)

		revalidatePath('/dashboard')
		return { success: true, error: null }
	} catch (err) {
		const error = err instanceof Error ? err.message : 'Unknown error'
		return { success: false, error }
	}
}

export async function getOverdueItemsController(): Promise<{
	success: boolean
	data: TrackableItem[] | null
	error: string | null
}> {
	try {
		const supabase = await createTypedServerClient()
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser()

		if (userError || !user) throw new Error('Not authenticated')

		const data = await itemService.getOverdueItems(user.id)
		return { success: true, data, error: null }
	} catch (err) {
		const error = err instanceof Error ? err.message : 'Unknown error'
		return { success: false, data: null, error }
	}
}

export async function getAwaitingReplyItemsController(): Promise<{
	success: boolean
	data: TrackableItem[] | null
	error: string | null
}> {
	try {
		const supabase = await createTypedServerClient()
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser()

		if (userError || !user) throw new Error('Not authenticated')

		const data = await itemService.getAwaitingReplyItems(user.id)
		return { success: true, data, error: null }
	} catch (err) {
		const error = err instanceof Error ? err.message : 'Unknown error'
		return { success: false, data: null, error }
	}
}

/**
 * Convenience wrapper: Marks an item as completed
 * Used by ItemActions component
 */
export async function markItemDone(itemId: string): Promise<{
	success: boolean
	data: TrackableItem | null
	error: string | null
}> {
	return updateItemStatusController(itemId, 'completed')
}

/**
 * Convenience wrapper: Updates item due date
 * Used by ItemActions component
 */
export async function updateItemDueDate(
	itemId: string,
	dueDate: string | null
): Promise<{
	success: boolean
	data: TrackableItem | null
	error: string | null
}> {
	return updateItemController(itemId, { due_date: dueDate })
}

/**
 * Convenience wrapper: Deletes an item (alias for deleteItemController)
 * Used by ItemActions component
 */
export async function deleteItemOptimized(itemId: string): Promise<{
	success: boolean
	error: string | null
}> {
	return deleteItemController(itemId)
}

/**
 * Creates a new item and refreshes the dashboard
 * Called from AddItemModal - accepts partial item data and infers user_id
 */
export async function createItemAndRefresh(
	item: Partial<TrackableItem> & { user_id?: string }
): Promise<{
	success: boolean
	data: TrackableItem | null
	error: string | null
}> {
	try {
		const supabase = await createTypedServerClient()
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser()

		if (userError || !user) throw new Error('Not authenticated')

		// Extract relevant fields and ensure defaults
		const itemData = await itemService.createItemInDatabase(user.id, {
			user_id: user.id,
			title: item.title || '',
			description: item.description || undefined,
			due_date: item.due_date || null,
			confidence: item.confidence || 0.5,
			status: 'pending',
			auto_extracted: false,
		})

		revalidatePath('/dashboard')
		return { success: true, data: itemData, error: null }
	} catch (err) {
		const error = err instanceof Error ? err.message : 'Unknown error'
		return { success: false, data: null, error }
	}
}
