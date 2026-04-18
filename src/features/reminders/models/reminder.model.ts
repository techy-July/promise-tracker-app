import type { Database } from '@/lib/database.types'

/**
 * Reminder types - directly from Supabase schema
 */
export type Reminder = Database['public']['Tables']['reminders']['Row']
export type ReminderInsert = Database['public']['Tables']['reminders']['Insert']
export type ReminderUpdate = Database['public']['Tables']['reminders']['Update']

/**
 * Reminder create payload
 */
export type ReminderCreate = Omit<ReminderInsert, 'id' | 'created_at'>
