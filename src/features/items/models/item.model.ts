import { z } from 'zod'
import type { Database } from '@/lib/database.types'

/**
 * Trackable Item types - directly from Supabase schema
 */
export type TrackableItem = Database['public']['Tables']['trackable_items']['Row']
export type TrackableItemInsert = Database['public']['Tables']['trackable_items']['Insert']
export type TrackableItemUpdate = Database['public']['Tables']['trackable_items']['Update']

/**
 * Trackable Item Draft - from AI extraction pipeline
 * Represents an actionable item extracted from an email
 * Note: `reply_tracking` table stores the awaited_reply state, not direct field on item
 */
export const TrackableItemDraftSchema = z.object({
	title: z.string().max(80).describe('max 80 chars, starts with verb'),
	description: z.string().optional(),
	due_date: z.string().nullable().describe('ISO 8601 or null'),
	confidence: z.number().min(0).max(1).describe('0.0–1.0'),
})

export type TrackableItemDraft = z.infer<typeof TrackableItemDraftSchema>
