'use server'

import { revalidatePath } from 'next/cache'
import { createTypedServerClient } from '@/lib/supabase-typed-server'
import { validateCategoryCreate } from '../validators/category.validator'
import * as categoryService from '../services/category.service'
import type { Category, CategoryUpdate } from '../models/category.model'

/**
 * Category Controller - orchestrates validators, services, and revalidation
 * Used by API route handlers
 */

export async function createCategoryController(categoryData: unknown): Promise<{
	success: boolean
	data: Category | null
	error: string | null
}> {
	try {
		// Validate input
		const validated = validateCategoryCreate(categoryData)

		// Get current user
		const supabase = await createTypedServerClient()
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser()

		if (userError || !user) throw new Error('Not authenticated')

		// Create category in database
		const data = await categoryService.createCategoryInDatabase(user.id, validated)

		// Revalidate affected routes
		revalidatePath('/dashboard')
		revalidatePath('/dashboard/categories')

		return { success: true, data, error: null }
	} catch (err) {
		const error = err instanceof Error ? err.message : 'Unknown error'
		return { success: false, data: null, error }
	}
}

export async function getCategoriesController(): Promise<{
	success: boolean
	data: Category[] | null
	error: string | null
}> {
	try {
		const supabase = await createTypedServerClient()
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser()

		if (userError || !user) throw new Error('Not authenticated')

		const data = await categoryService.getUserCategories(user.id)
		return { success: true, data, error: null }
	} catch (err) {
		const error = err instanceof Error ? err.message : 'Unknown error'
		return { success: false, data: null, error }
	}
}

export async function updateCategoryController(
	categoryId: string,
	updates: CategoryUpdate
): Promise<{
	success: boolean
	data: Category | null
	error: string | null
}> {
	try {
		const supabase = await createTypedServerClient()
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser()

		if (userError || !user) throw new Error('Not authenticated')

		const data = await categoryService.updateCategoryInDatabase(user.id, categoryId, updates)

		revalidatePath('/dashboard')
		revalidatePath('/dashboard/categories')

		return { success: true, data, error: null }
	} catch (err) {
		const error = err instanceof Error ? err.message : 'Unknown error'
		return { success: false, data: null, error }
	}
}

export async function deleteCategoryController(categoryId: string): Promise<{
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

		await categoryService.deleteCategoryFromDatabase(user.id, categoryId)

		revalidatePath('/dashboard')
		revalidatePath('/dashboard/categories')

		return { success: true, error: null }
	} catch (err) {
		const error = err instanceof Error ? err.message : 'Unknown error'
		return { success: false, error }
	}
}

export async function getCategoryByIdController(categoryId: string): Promise<{
	success: boolean
	data: Category | null
	error: string | null
}> {
	try {
		const supabase = await createTypedServerClient()
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser()

		if (userError || !user) throw new Error('Not authenticated')

		const data = await categoryService.getCategoryById(user.id, categoryId)
		return { success: true, data, error: null }
	} catch (err) {
		const error = err instanceof Error ? err.message : 'Unknown error'
		return { success: false, data: null, error }
	}
}

/**
 * Convenience wrapper: Alias for getCategoriesController
 * Used by legacy components
 */
export async function getCategories(): Promise<{
	success: boolean
	data: Category[] | null
	error: string | null
}> {
	return getCategoriesController()
}

/**
 * Convenience wrapper: Creates a category from individual parameters
 * Used by CategoriesPage
 */
export async function createCategory(
	name: string,
	colorHex: string,
	keywords?: string[]
): Promise<{
	success: boolean
	data: Category | null
	error: string | null
}> {
	return createCategoryController({
		name,
		color_hex: colorHex,
		keywords,
	})
}

/**
 * Convenience wrapper: Updates a category from individual parameters
 * Used by CategoriesPage
 */
export async function updateCategory(
	id: string,
	updates: { name?: string; color_hex?: string; keywords?: string[] }
): Promise<{
	success: boolean
	data: Category | null
	error: string | null
}> {
	return updateCategoryController(id, {
		name: updates.name,
		color_hex: updates.color_hex,
		keywords: updates.keywords,
	})
}

/**
 * Convenience wrapper: Alias for deleteCategoryController
 * Used by CategoriesPage
 */
export async function deleteCategory(id: string): Promise<{
	success: boolean
	error: string | null
}> {
	return deleteCategoryController(id)
}
