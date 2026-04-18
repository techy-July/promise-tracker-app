import type { z } from 'zod'
import { CategorySchema } from '../models/category.model'

/**
 * Validator for creating a category
 * Throws ZodError on validation failure
 */
export const CategoryCreateSchema = CategorySchema.omit({
	id: true,
	user_id: true,
	created_at: true,
	updated_at: true,
})

export function validateCategoryCreate(data: unknown): z.infer<typeof CategoryCreateSchema> {
	return CategoryCreateSchema.parse(data)
}

/**
 * Safe validation - returns error instead of throwing
 */
export function validateCategoryCreateSafe(data: unknown): {
	success: boolean
	data?: z.infer<typeof CategoryCreateSchema>
	error?: z.ZodError
} {
	const result = CategoryCreateSchema.safeParse(data)
	return result.success
		? { success: true, data: result.data }
		: { success: false, error: result.error }
}
