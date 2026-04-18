/**
 * Scan Log - future table for tracking bulk email scanning progress
 * NOTE: This table does not currently exist in the database schema
 * Will be created when implementing the Gmail bulk scan feature
 */
export interface ScanLog {
	id: string
	user_id: string
	status: 'pending' | 'running' | 'completed' | 'failed'
	total_emails: number
	processed: number
	skipped: number
	error_message: string | null
	created_at: string
	completed_at: string | null
}

/**
 * Scan log create payload
 */
export type ScanLogCreate = Omit<
	ScanLog,
	'id' | 'created_at' | 'completed_at' | 'processed' | 'skipped'
> & {
	processed?: number
	skipped?: number
	completed_at?: string | null
}
