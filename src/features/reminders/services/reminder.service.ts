'use server'

import { createTypedServerClient } from '@/lib/supabase-typed-server'
import type { Reminder, ReminderCreate } from '../models/reminder.model'

/**
 * Reminder Service - handles all database queries for reminders
 */

export async function createReminderInDatabase(
	userId: string,
	reminder: ReminderCreate
): Promise<Reminder> {
	const supabase = await createTypedServerClient()

	const { data, error } = await supabase
		.from('reminders')
		.insert([
			{
				...reminder,
				user_id: userId,
			},
		])
		.select()
		.single()

	if (error) throw new Error(`Failed to create reminder: ${error.message}`)
	return data
}

export async function getRemindersByItem(userId: string, itemId: string): Promise<Reminder[]> {
	const supabase = await createTypedServerClient()

	const { data, error } = await supabase
		.from('reminders')
		.select('*')
		.eq('user_id', userId)
		.eq('item_id', itemId)
		.order('scheduled_for', { ascending: true })

	if (error) throw new Error(`Failed to fetch reminders: ${error.message}`)
	return data || []
}

export async function getPendingReminders(userId: string): Promise<Reminder[]> {
	const supabase = await createTypedServerClient()

	const now = new Date().toISOString()
	const { data, error } = await supabase
		.from('reminders')
		.select('*')
		.eq('user_id', userId)
		.eq('status', 'pending')
		.lte('scheduled_for', now)
		.order('scheduled_for', { ascending: true })

	if (error) throw new Error(`Failed to fetch pending reminders: ${error.message}`)
	return data || []
}

export async function markReminderSent(userId: string, reminderId: string): Promise<void> {
	const supabase = await createTypedServerClient()

	const { error } = await supabase
		.from('reminders')
		.update({
			status: 'sent',
			sent_at: new Date().toISOString(),
		})
		.eq('user_id', userId)
		.eq('id', reminderId)

	if (error) throw new Error(`Failed to mark reminder sent: ${error.message}`)
}

export async function markReminderFailed(userId: string, reminderId: string): Promise<void> {
	const supabase = await createTypedServerClient()

	const { error } = await supabase
		.from('reminders')
		.update({ status: 'failed' })
		.eq('user_id', userId)
		.eq('id', reminderId)

	if (error) throw new Error(`Failed to mark reminder failed: ${error.message}`)
}

export async function deleteReminder(userId: string, reminderId: string): Promise<void> {
	const supabase = await createTypedServerClient()

	const { error } = await supabase
		.from('reminders')
		.delete()
		.eq('user_id', userId)
		.eq('id', reminderId)

	if (error) throw new Error(`Failed to delete reminder: ${error.message}`)
}
