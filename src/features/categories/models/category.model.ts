import type { Database } from '@/lib/database.types'

/**
 * Category types - directly from Supabase schema
 */
export type Category = Database['public']['Tables']['categories']['Row']
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']
export type CategoryUpdate = Database['public']['Tables']['categories']['Update']

/**
 * Category create payload - with defaults
 */
export type CategoryCreate = Omit<CategoryInsert, 'user_id'>

/**
 * Category update payload
 */
export type CategoryUpdatePayload = Partial<Omit<CategoryUpdate, 'user_id' | 'id'>>
