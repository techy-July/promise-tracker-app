import type { z } from 'zod'
import { TrackableItemDraftSchema } from '../models/item.model'

/**
 * Validator for creating a trackable item
 * Throws ZodError on validation failure
 */
export function validateTrackableItemDraft(
	data: unknown
): z.infer<typeof TrackableItemDraftSchema> {
	return TrackableItemDraftSchema.parse(data)
}

/**
 * Safe validation - returns error instead of throwing
 */
export function validateTrackableItemDraftSafe(data: unknown): {
	success: boolean
	data?: z.infer<typeof TrackableItemDraftSchema>
	error?: z.ZodError
} {
	const result = TrackableItemDraftSchema.safeParse(data)
	return result.success
		? { success: true, data: result.data }
		: { success: false, error: result.error }
}
