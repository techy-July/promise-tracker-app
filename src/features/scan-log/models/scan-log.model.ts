import { z } from 'zod'

/**
 * Scan Log - tracks bulk email scanning progress
 */
export const ScanLogSchema = z.object({
	id: z.string(),
	user_id: z.string(),
	status: z.enum(['pending', 'running', 'completed', 'failed']),
	total_emails: z.number(),
	processed: z.number(),
	skipped: z.number(),
	error_message: z.string().nullable(),
	created_at: z.string(),
	completed_at: z.string().nullable(),
})

export type ScanLog = z.infer<typeof ScanLogSchema>

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
