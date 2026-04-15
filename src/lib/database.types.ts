export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
	// Allows to automatically instantiate createClient with right options
	// instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
	__InternalSupabase: {
		PostgrestVersion: '14.5'
	}
	public: {
		Tables: {
			categories: {
				Row: {
					color_hex: string
					created_at: string
					icon: string | null
					id: string
					is_default: boolean
					keywords: string[]
					name: string
					user_id: string
				}
				Insert: {
					color_hex?: string
					created_at?: string
					icon?: string | null
					id?: string
					is_default?: boolean
					keywords?: string[]
					name: string
					user_id: string
				}
				Update: {
					color_hex?: string
					created_at?: string
					icon?: string | null
					id?: string
					is_default?: boolean
					keywords?: string[]
					name?: string
					user_id?: string
				}
				Relationships: []
			}
			extraction_rules: {
				Row: {
					created_at: string
					default_category_id: string | null
					default_priority: number
					id: string
					is_active: boolean
					pattern_type: string
					pattern_value: string
					user_id: string
				}
				Insert: {
					created_at?: string
					default_category_id?: string | null
					default_priority?: number
					id?: string
					is_active?: boolean
					pattern_type?: string
					pattern_value: string
					user_id: string
				}
				Update: {
					created_at?: string
					default_category_id?: string | null
					default_priority?: number
					id?: string
					is_active?: boolean
					pattern_type?: string
					pattern_value?: string
					user_id?: string
				}
				Relationships: [
					{
						foreignKeyName: 'extraction_rules_default_category_id_fkey'
						columns: ['default_category_id']
						isOneToOne: false
						referencedRelation: 'categories'
						referencedColumns: ['id']
					},
				]
			}
			item_tags: {
				Row: {
					item_id: string
					tag_id: string
				}
				Insert: {
					item_id: string
					tag_id: string
				}
				Update: {
					item_id?: string
					tag_id?: string
				}
				Relationships: [
					{
						foreignKeyName: 'item_tags_item_id_fkey'
						columns: ['item_id']
						isOneToOne: false
						referencedRelation: 'trackable_items'
						referencedColumns: ['id']
					},
					{
						foreignKeyName: 'item_tags_tag_id_fkey'
						columns: ['tag_id']
						isOneToOne: false
						referencedRelation: 'tags'
						referencedColumns: ['id']
					},
				]
			}
			notification_channels: {
				Row: {
					channel_type: string
					created_at: string
					destination: string
					id: string
					is_active: boolean
					is_verified: boolean
					label: string | null
					user_id: string
				}
				Insert: {
					channel_type: string
					created_at?: string
					destination: string
					id?: string
					is_active?: boolean
					is_verified?: boolean
					label?: string | null
					user_id: string
				}
				Update: {
					channel_type?: string
					created_at?: string
					destination?: string
					id?: string
					is_active?: boolean
					is_verified?: boolean
					label?: string | null
					user_id?: string
				}
				Relationships: []
			}
			reminders: {
				Row: {
					channel_id: string | null
					created_at: string
					id: string
					item_id: string
					remind_at: string
					sent_at: string | null
					status: string
				}
				Insert: {
					channel_id?: string | null
					created_at?: string
					id?: string
					item_id: string
					remind_at: string
					sent_at?: string | null
					status?: string
				}
				Update: {
					channel_id?: string | null
					created_at?: string
					id?: string
					item_id?: string
					remind_at?: string
					sent_at?: string | null
					status?: string
				}
				Relationships: [
					{
						foreignKeyName: 'reminders_channel_id_fkey'
						columns: ['channel_id']
						isOneToOne: false
						referencedRelation: 'notification_channels'
						referencedColumns: ['id']
					},
					{
						foreignKeyName: 'reminders_item_id_fkey'
						columns: ['item_id']
						isOneToOne: false
						referencedRelation: 'trackable_items'
						referencedColumns: ['id']
					},
				]
			}
			reply_tracking: {
				Row: {
					awaiting_reply: boolean
					created_at: string
					external_thread_id: string | null
					id: string
					item_id: string
					last_checked_at: string | null
					nudge_after_days: number
					platform: string
					replied_at: string | null
				}
				Insert: {
					awaiting_reply?: boolean
					created_at?: string
					external_thread_id?: string | null
					id?: string
					item_id: string
					last_checked_at?: string | null
					nudge_after_days?: number
					platform?: string
					replied_at?: string | null
				}
				Update: {
					awaiting_reply?: boolean
					created_at?: string
					external_thread_id?: string | null
					id?: string
					item_id?: string
					last_checked_at?: string | null
					nudge_after_days?: number
					platform?: string
					replied_at?: string | null
				}
				Relationships: [
					{
						foreignKeyName: 'reply_tracking_item_id_fkey'
						columns: ['item_id']
						isOneToOne: true
						referencedRelation: 'trackable_items'
						referencedColumns: ['id']
					},
				]
			}
			tags: {
				Row: {
					id: string
					label: string
					user_id: string
				}
				Insert: {
					id?: string
					label: string
					user_id: string
				}
				Update: {
					id?: string
					label?: string
					user_id?: string
				}
				Relationships: []
			}
			trackable_items: {
				Row: {
					auto_extracted: boolean
					category_id: string | null
					confidence: number | null
					created_at: string
					description: string | null
					due_date: string | null
					id: string
					priority: number
					snoozed_until: string | null
					source_raw: string | null
					source_type: string
					status: string
					title: string
					updated_at: string
					user_id: string
				}
				Insert: {
					auto_extracted?: boolean
					category_id?: string | null
					confidence?: number | null
					created_at?: string
					description?: string | null
					due_date?: string | null
					id?: string
					priority?: number
					snoozed_until?: string | null
					source_raw?: string | null
					source_type?: string
					status?: string
					title: string
					updated_at?: string
					user_id: string
				}
				Update: {
					auto_extracted?: boolean
					category_id?: string | null
					confidence?: number | null
					created_at?: string
					description?: string | null
					due_date?: string | null
					id?: string
					priority?: number
					snoozed_until?: string | null
					source_raw?: string | null
					source_type?: string
					status?: string
					title?: string
					updated_at?: string
					user_id?: string
				}
				Relationships: [
					{
						foreignKeyName: 'trackable_items_category_id_fkey'
						columns: ['category_id']
						isOneToOne: false
						referencedRelation: 'categories'
						referencedColumns: ['id']
					},
				]
			}
		}
		Views: {
			[_ in never]: never
		}
		Functions: {
			mark_overdue_items: { Args: never; Returns: undefined }
			seed_default_categories: {
				Args: { p_user_id: string }
				Returns: undefined
			}
		}
		Enums: {
			[_ in never]: never
		}
		CompositeTypes: {
			[_ in never]: never
		}
	}
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
				DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
			DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
			Row: infer R
		}
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
		? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
				Row: infer R
			}
			? R
			: never
		: never

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema['Tables']
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Insert: infer I
		}
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
		? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
				Insert: infer I
			}
			? I
			: never
		: never

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema['Tables']
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Update: infer U
		}
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
		? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
				Update: infer U
			}
			? U
			: never
		: never

export type Enums<
	DefaultSchemaEnumNameOrOptions extends
		| keyof DefaultSchema['Enums']
		| { schema: keyof DatabaseWithoutInternals },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
		: never = never,
> = DefaultSchemaEnumNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
		? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
		: never

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof DefaultSchema['CompositeTypes']
		| { schema: keyof DatabaseWithoutInternals },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
		: never = never,
> = PublicCompositeTypeNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
		? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
		: never

export const Constants = {
	public: {
		Enums: {},
	},
} as const
