import { z } from 'zod'

/**
 * Trackable Item Draft - from AI extraction pipeline
 * Represents an actionable item extracted from an email
 */
export const TrackableItemDraftSchema = z.object({
	title: z.string().max(80).describe('max 80 chars, starts with verb'),
	description: z.string().optional(),
	due_date: z.string().nullable().describe('ISO 8601 or null'),
	awaited_reply: z.boolean(),
	confidence: z.number().min(0).max(1).describe('0.0–1.0'),
})

export type TrackableItemDraft = z.infer<typeof TrackableItemDraftSchema>

/**
 * Trackable Item - database row
 * Same as database schema, imported from database.types.ts
 */
export interface TrackableItem {
	id: string
	user_id: string
	title: string
	description?: string | null
	status: 'pending' | 'completed' | 'cancelled'
	due_date?: string | null
	category_id?: string | null
	auto_extracted: boolean
	confidence?: number | null
	awaited_reply: boolean
	created_at: string
	updated_at: string
}

/**
 * Trackable Item partial (for updates)
 */
export type TrackableItemUpdate = Partial<Omit<TrackableItem, 'id' | 'user_id' | 'created_at'>>
