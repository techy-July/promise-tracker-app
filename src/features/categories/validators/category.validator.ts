import { z } from 'zod'

/**
 * Validator for creating a category
 */
export const CategoryCreateSchema = z.object({
	name: z.string().min(1, 'Category name is required'),
	color_hex: z.string().optional(),
	icon: z.string().optional(),
	is_default: z.boolean().optional(),
	keywords: z.array(z.string()).optional().default([]),
})

export type CategoryCreateInput = z.infer<typeof CategoryCreateSchema>

export function validateCategoryCreate(data: unknown): CategoryCreateInput {
	return CategoryCreateSchema.parse(data)
}

/**
 * Safe validation - returns error instead of throwing
 */
export function validateCategoryCreateSafe(data: unknown): {
	success: boolean
	data?: CategoryCreateInput
	error?: z.ZodError
} {
	const result = CategoryCreateSchema.safeParse(data)
	return result.success
		? { success: true, data: result.data }
		: { success: false, error: result.error }
}
