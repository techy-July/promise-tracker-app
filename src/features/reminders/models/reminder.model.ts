import { z } from 'zod'

/**
 * Reminder - scheduled notification for an item
 */
export const ReminderSchema = z.object({
	id: z.string(),
	user_id: z.string(),
	item_id: z.string(),
	scheduled_for: z.string().describe('ISO 8601'),
	sent_at: z.string().nullable().describe('ISO 8601 or null'),
	channel: z.enum(['email', 'slack']),
	status: z.enum(['pending', 'sent', 'failed']),
	created_at: z.string(),
})

export type Reminder = z.infer<typeof ReminderSchema>

/**
 * Reminder create payload
 */
export type ReminderCreate = Omit<Reminder, 'id' | 'created_at' | 'sent_at'>
