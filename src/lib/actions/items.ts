'use server'

import { revalidatePath } from 'next/cache'
import { createTypedServerClient } from '@/lib/supabase-typed-server'
import type { TablesInsert, TablesUpdate } from '@/lib/database.types'

type TrackableItem = TablesInsert<'trackable_items'>
type ItemUpdate = TablesUpdate<'trackable_items'>

/**
 * Creates a new trackable item in the database
 * @param item - The item data to insert
 * @returns The created item or error
 */
export async function createItem(item: TrackableItem) {
	try {
		const supabase = await createTypedServerClient()

		const { data, error } = await supabase.from('trackable_items').insert([item]).select().single()

		if (error) {
			throw new Error(`Failed to create item: ${error.message}`)
		}

		revalidatePath('/dashboard')
		revalidatePath('/dashboard/items')
		return { data, error: null }
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Unknown error'
		return { data: null, error: message }
	}
}

/**
 * Updates the status of a trackable item
 * @param id - The item ID
 * @param status - The new status
 * @returns Updated item or error
 */
export async function updateItemStatus(id: string, status: string) {
	try {
		const supabase = await createTypedServerClient()

		const { data, error } = await supabase
			.from('trackable_items')
			.update({ status, updated_at: new Date().toISOString() })
			.eq('id', id)
			.select()
			.single()

		if (error) {
			throw new Error(`Failed to update item status: ${error.message}`)
		}

		revalidatePath('/dashboard')
		revalidatePath('/dashboard/items')
		return { data, error: null }
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Unknown error'
		return { data: null, error: message }
	}
}

/**
 * Updates multiple fields of a trackable item
 * @param id - The item ID
 * @param updates - The fields to update
 * @returns Updated item or error
 */
export async function updateItem(id: string, updates: ItemUpdate) {
	try {
		const supabase = await createTypedServerClient()

		const { data, error } = await supabase
			.from('trackable_items')
			.update({ ...updates, updated_at: new Date().toISOString() })
			.eq('id', id)
			.select()
			.single()

		if (error) {
			throw new Error(`Failed to update item: ${error.message}`)
		}

		revalidatePath('/dashboard')
		revalidatePath('/dashboard/items')
		return { data, error: null }
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Unknown error'
		return { data: null, error: message }
	}
}

/**
 * Deletes a trackable item from the database
 * @param id - The item ID to delete
 * @returns Success or error
 */
export async function deleteItem(id: string) {
	try {
		const supabase = await createTypedServerClient()

		const { error } = await supabase.from('trackable_items').delete().eq('id', id)

		if (error) {
			throw new Error(`Failed to delete item: ${error.message}`)
		}

		revalidatePath('/dashboard')
		revalidatePath('/dashboard/items')
		return { success: true, error: null }
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Unknown error'
		return { success: false, error: message }
	}
}

/**
 * Fetches all items for the current user
 * @returns Array of items or error
 */
export async function getUserItems() {
	try {
		const supabase = await createTypedServerClient()

		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser()

		if (userError || !user) {
			throw new Error('Not authenticated')
		}

		const { data, error } = await supabase
			.from('trackable_items')
			.select('*')
			.eq('user_id', user.id)
			.order('created_at', { ascending: false })

		if (error) {
			throw new Error(`Failed to fetch items: ${error.message}`)
		}

		return { data, error: null }
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Unknown error'
		return { data: null, error: message }
	}
}

/**
 * Fetches a single item by ID
 * @param id - The item ID
 * @returns Item or error
 */
export async function getItem(id: string) {
	try {
		const supabase = await createTypedServerClient()

		const { data, error } = await supabase.from('trackable_items').select('*').eq('id', id).single()

		if (error) {
			throw new Error(`Failed to fetch item: ${error.message}`)
		}

		return { data, error: null }
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Unknown error'
		return { data: null, error: message }
	}
}
