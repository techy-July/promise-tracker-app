'use server'

import { createTypedServerClient } from '@/lib/supabase-typed-server'
import type { Category, CategoryCreate, CategoryUpdate } from '../models/category.model'

/**
 * Category Service - handles all database queries for categories
 * No business logic, just DB operations
 */

export async function createCategoryInDatabase(
	userId: string,
	category: CategoryCreate
): Promise<Category> {
	const supabase = await createTypedServerClient()

	const { data, error } = await supabase
		.from('categories')
		.insert([
			{
				...category,
				user_id: userId,
			},
		])
		.select()
		.single()

	if (error) throw new Error(`Failed to create category: ${error.message}`)
	return data
}

export async function getCategoryById(
	userId: string,
	categoryId: string
): Promise<Category | null> {
	const supabase = await createTypedServerClient()

	const { data, error } = await supabase
		.from('categories')
		.select('*')
		.eq('user_id', userId)
		.eq('id', categoryId)
		.single()

	if (error && error.code !== 'PGRST116') {
		// PGRST116 = no rows found
		throw new Error(`Failed to fetch category: ${error.message}`)
	}

	return data || null
}

export async function getUserCategories(userId: string): Promise<Category[]> {
	const supabase = await createTypedServerClient()

	const { data, error } = await supabase
		.from('categories')
		.select('*')
		.eq('user_id', userId)
		.order('name', { ascending: true })

	if (error) throw new Error(`Failed to fetch categories: ${error.message}`)
	return data || []
}

export async function updateCategoryInDatabase(
	userId: string,
	categoryId: string,
	updates: CategoryUpdate
): Promise<Category> {
	const supabase = await createTypedServerClient()

	const { data, error } = await supabase
		.from('categories')
		.update(updates)
		.eq('user_id', userId)
		.eq('id', categoryId)
		.select()
		.single()

	if (error) throw new Error(`Failed to update category: ${error.message}`)
	return data
}

export async function deleteCategoryFromDatabase(
	userId: string,
	categoryId: string
): Promise<void> {
	const supabase = await createTypedServerClient()

	const { error } = await supabase
		.from('categories')
		.delete()
		.eq('user_id', userId)
		.eq('id', categoryId)

	if (error) throw new Error(`Failed to delete category: ${error.message}`)
}

export async function getCategoriesByKeyword(userId: string, keyword: string): Promise<Category[]> {
	const supabase = await createTypedServerClient()

	const { data, error } = await supabase
		.from('categories')
		.select('*')
		.eq('user_id', userId)
		.contains('keywords', [keyword])

	if (error) throw new Error(`Failed to fetch categories by keyword: ${error.message}`)
	return data || []
}
