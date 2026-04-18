import { z } from 'zod'

/**
 * Validator for creating a trackable item
 */
export const TrackableItemDraftSchema = z.object({
	title: z.string().min(1, 'Item title is required'),
	description: z.string().optional().default(''),
	category_id: z.string().nullable().optional(),
	due_date: z.string().nullable().optional(),
	priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
	status: z.enum(['pending', 'completed', 'archived']).optional().default('pending'),
	source_type: z.string().optional(),
	source_raw: z.string().optional(),
	auto_extracted: z.boolean().optional().default(false),
	confidence: z.number().min(0).max(1).optional(),
})

export type TrackableItemDraft = z.infer<typeof TrackableItemDraftSchema>

export function validateTrackableItemDraft(data: unknown): TrackableItemDraft {
	return TrackableItemDraftSchema.parse(data)
}

/**
 * Safe validation - returns error instead of throwing
 */
export function validateTrackableItemDraftSafe(data: unknown): {
	success: boolean
	data?: TrackableItemDraft
	error?: z.ZodError
} {
	const result = TrackableItemDraftSchema.safeParse(data)
	return result.success
		? { success: true, data: result.data }
		: { success: false, error: result.error }
}
