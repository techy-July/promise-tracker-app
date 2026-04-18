'use server'

import { revalidatePath } from 'next/cache'
import { createTypedServerClient } from '@/lib/supabase-typed-server'
import type { TablesInsert } from '@/lib/database.types'

type TrackableItem = TablesInsert<'trackable_items'>

/**
 * Fetches categories for the current user
 * @returns Array of categories or error
 */
export async function getCategories() {
	try {
		const supabase = await createTypedServerClient()

		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser()

		if (userError || !user) {
			throw new Error('Not authenticated')
		}

		const { data, error } = await supabase.from('categories').select('*').eq('user_id', user.id)

		if (error) {
			throw new Error(`Failed to fetch categories: ${error.message}`)
		}

		return { data, error: null, success: true }
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Unknown error'
		return { data: null, error: message, success: false }
	}
}

/**
 * Creates a new item and refreshes the dashboard
 * Called from the AddItem form
 */
export async function createItemAndRefresh(
	item: Omit<TrackableItem, 'user_id'> & { user_id?: string }
) {
	try {
		const supabase = await createTypedServerClient()

		// Get the authenticated user
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser()

		if (userError || !user) {
			throw new Error('Not authenticated')
		}

		// Ensure user_id is set
		const itemData = {
			...item,
			user_id: user.id,
		}

		const { data, error } = await supabase
			.from('trackable_items')
			.insert([itemData as TrackableItem])
			.select()
			.single()

		if (error) {
			throw new Error(`Failed to create item: ${error.message}`)
		}

		// Revalidate dashboard to show new item
		revalidatePath('/dashboard')
		return { data, error: null, success: true }
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Unknown error'
		return { data: null, error: message, success: false }
	}
}

/**
 * Creates a new category for the user
 */
export async function createCategory(name: string, colorHex: string, keywords?: string[]) {
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
			.from('categories')
			.insert([
				{
					name,
					color_hex: colorHex,
					keywords: keywords || [],
					user_id: user.id,
					is_default: false,
				},
			])
			.select()
			.single()

		if (error) {
			throw new Error(`Failed to create category: ${error.message}`)
		}

		revalidatePath('/dashboard/categories')
		return { data, error: null, success: true }
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Unknown error'
		return { data: null, error: message, success: false }
	}
}

/**
 * Updates an existing category
 */
export async function updateCategory(
	id: string,
	updates: { name?: string; color_hex?: string; keywords?: string[] }
) {
	try {
		const supabase = await createTypedServerClient()

		const { data, error } = await supabase
			.from('categories')
			.update(updates)
			.eq('id', id)
			.select()
			.single()

		if (error) {
			throw new Error(`Failed to update category: ${error.message}`)
		}

		revalidatePath('/dashboard/categories')
		return { data, error: null, success: true }
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Unknown error'
		return { data: null, error: message, success: false }
	}
}

/**
 * Deletes a category
 */
export async function deleteCategory(id: string) {
	try {
		const supabase = await createTypedServerClient()

		const { error } = await supabase.from('categories').delete().eq('id', id)

		if (error) {
			throw new Error(`Failed to delete category: ${error.message}`)
		}

		revalidatePath('/dashboard/categories')
		return { success: true, error: null }
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Unknown error'
		return { success: false, error: message }
	}
}
