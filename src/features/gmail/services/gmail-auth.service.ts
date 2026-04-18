'use server'

import { createTypedServerClient } from '@/lib/supabase-typed-server'
import type { GmailTokenData } from '../models/gmail.model'

/**
 * Gmail Auth Service
 * Handles OAuth token storage and refresh
 */

export async function storeGmailToken(userId: string, tokenData: GmailTokenData): Promise<void> {
	const supabase = await createTypedServerClient()

	// TODO: Store token in user_oauth_tokens table
	// Use Supabase encryption for sensitive data
}

export async function getGmailToken(userId: string): Promise<GmailTokenData | null> {
	const supabase = await createTypedServerClient()

	// TODO: Retrieve token from user_oauth_tokens table
	// Decrypt and validate expiration
	// Refresh if expired

	return null
}

export async function revokeGmailToken(userId: string): Promise<void> {
	const supabase = await createTypedServerClient()

	// TODO: Remove token from user_oauth_tokens table
	// Call Gmail API to revoke token
}
