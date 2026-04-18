import { z } from 'zod'

/**
 * Category - user-defined category for grouping items
 */
export const CategorySchema = z.object({
	id: z.string(),
	user_id: z.string(),
	name: z.string(),
	keywords: z.array(z.string()).optional(),
	color: z.string().optional(),
	created_at: z.string(),
	updated_at: z.string(),
})

export type Category = z.infer<typeof CategorySchema>

/**
 * Category create payload (omits id, user_id, timestamps)
 */
export type CategoryCreate = Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at'>

/**
 * Category update payload
 */
export type CategoryUpdate = Partial<CategoryCreate>
