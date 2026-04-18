'use server'

import { createTypedServerClient } from '@/lib/supabase-typed-server'
import type { ScanLog, ScanLogCreate } from '../models/scan-log.model'

/**
 * Scan Log Service - handles all database queries for scan logs
 */

export async function createScanLogInDatabase(
	userId: string,
	log: ScanLogCreate
): Promise<ScanLog> {
	const supabase = await createTypedServerClient()

	const { data, error } = await supabase
		.from('scan_logs')
		.insert([
			{
				...log,
				user_id: userId,
				processed: log.processed || 0,
				skipped: log.skipped || 0,
			},
		])
		.select()
		.single()

	if (error) throw new Error(`Failed to create scan log: ${error.message}`)
	return data
}

export async function getScanLogById(userId: string, scanLogId: string): Promise<ScanLog | null> {
	const supabase = await createTypedServerClient()

	const { data, error } = await supabase
		.from('scan_logs')
		.select('*')
		.eq('user_id', userId)
		.eq('id', scanLogId)
		.single()

	if (error && error.code !== 'PGRST116') {
		throw new Error(`Failed to fetch scan log: ${error.message}`)
	}

	return data || null
}

export async function getLatestScanLog(userId: string): Promise<ScanLog | null> {
	const supabase = await createTypedServerClient()

	const { data, error } = await supabase
		.from('scan_logs')
		.select('*')
		.eq('user_id', userId)
		.order('created_at', { ascending: false })
		.limit(1)
		.single()

	if (error && error.code !== 'PGRST116') {
		throw new Error(`Failed to fetch latest scan log: ${error.message}`)
	}

	return data || null
}

export async function updateScanLogProgress(
	userId: string,
	scanLogId: string,
	processed: number,
	skipped: number
): Promise<ScanLog> {
	const supabase = await createTypedServerClient()

	const { data, error } = await supabase
		.from('scan_logs')
		.update({ processed, skipped })
		.eq('user_id', userId)
		.eq('id', scanLogId)
		.select()
		.single()

	if (error) throw new Error(`Failed to update scan log: ${error.message}`)
	return data
}

export async function completeScanLog(
	userId: string,
	scanLogId: string,
	status: 'completed' | 'failed',
	errorMessage?: string
): Promise<ScanLog> {
	const supabase = await createTypedServerClient()

	const { data, error } = await supabase
		.from('scan_logs')
		.update({
			status,
			completed_at: new Date().toISOString(),
			error_message: errorMessage || null,
		})
		.eq('user_id', userId)
		.eq('id', scanLogId)
		.select()
		.single()

	if (error) throw new Error(`Failed to complete scan log: ${error.message}`)
	return data
}

export async function getUserScanLogs(userId: string, limit = 10): Promise<ScanLog[]> {
	const supabase = await createTypedServerClient()

	const { data, error } = await supabase
		.from('scan_logs')
		.select('*')
		.eq('user_id', userId)
		.order('created_at', { ascending: false })
		.limit(limit)

	if (error) throw new Error(`Failed to fetch scan logs: ${error.message}`)
	return data || []
}
