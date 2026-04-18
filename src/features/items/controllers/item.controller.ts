'use server'

import { revalidatePath } from 'next/cache'
import { createTypedServerClient } from '@/lib/supabase-typed-server'
import {
	validateTrackableItemDraft,
	validateTrackableItemDraftSafe,
} from '../validators/item.validator'
import * as itemService from '../services/item.service'
import type { TrackableItem, TrackableItemDraft, TrackableItemUpdate } from '../models/item.model'

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
			title: validated.title,
			description: validated.description,
			due_date: validated.due_date,
			awaited_reply: validated.awaited_reply,
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
