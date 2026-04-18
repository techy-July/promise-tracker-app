'use server'

import { google } from 'googleapis'
import { createTypedServerClient } from '@/lib/supabase-typed-server'
import type { GmailTokenData } from '../models/gmail.model'

const oauth2Client = new google.auth.OAuth2(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	process.env.GOOGLE_REDIRECT_URI
)

/**
 * Gmail Auth Service
 * Handles OAuth token storage and refresh
 */

/**
 * Store Gmail OAuth token in database
 */
export async function storeGmailToken(userId: string, tokenData: GmailTokenData): Promise<void> {
	const supabase = await createTypedServerClient()

	const { error } = await supabase.from('user_oauth_tokens').upsert(
		{
			user_id: userId,
			provider: 'gmail',
			access_token: tokenData.access_token,
			refresh_token: tokenData.refresh_token || null,
			expires_at: tokenData.expires_at ? new Date(tokenData.expires_at).toISOString() : null,
			updated_at: new Date().toISOString(),
		},
		{ onConflict: 'user_id' }
	)

	if (error) {
		throw new Error(`Failed to store Gmail token: ${error.message}`)
	}
}

/**
 * Retrieve Gmail OAuth token from database
 * Automatically refreshes if expired
 */
export async function getGmailToken(userId: string): Promise<GmailTokenData | null> {
	const supabase = await createTypedServerClient()

	const { data, error } = await supabase
		.from('user_oauth_tokens')
		.select('*')
		.eq('user_id', userId)
		.single()

	if (error || !data) {
		return null
	}

	let tokenData: GmailTokenData = {
		access_token: data.access_token,
		refresh_token: data.refresh_token || undefined,
		expires_at: data.expires_at ? new Date(data.expires_at).getTime() : Date.now() + 3600 * 1000,
		token_type: 'Bearer',
		scope:
			'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify',
	}

	// Check if token is expired or expires within 5 minutes
	if (tokenData.expires_at && tokenData.expires_at - Date.now() < 5 * 60 * 1000) {
		// Attempt refresh if refresh token available
		if (tokenData.refresh_token) {
			try {
				tokenData = await refreshGmailToken(userId, tokenData)
			} catch (err) {
				console.error('Token refresh failed:', err)
				// Return stale token anyway, caller can handle expiration
			}
		}
	}

	return tokenData
}

/**
 * Refresh an expired Gmail OAuth token
 */
export async function refreshGmailToken(
	userId: string,
	tokenData: GmailTokenData
): Promise<GmailTokenData> {
	if (!tokenData.refresh_token) {
		throw new Error('No refresh token available')
	}

	try {
		oauth2Client.setCredentials({
			access_token: tokenData.access_token,
			refresh_token: tokenData.refresh_token,
		})

		const { credentials } = await oauth2Client.refreshAccessToken()

		const newTokenData: GmailTokenData = {
			access_token: credentials.access_token || tokenData.access_token,
			refresh_token: credentials.refresh_token || tokenData.refresh_token,
			expires_at: credentials.expiry_date || Date.now() + 3600 * 1000,
			token_type: credentials.token_type || 'Bearer',
			scope: credentials.scope || tokenData.scope,
		}

		// Store refreshed token
		await storeGmailToken(userId, newTokenData)

		return newTokenData
	} catch (err) {
		throw new Error(`Token refresh failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
	}
}

/**
 * Revoke Gmail OAuth token and delete from database
 */
export async function revokeGmailToken(userId: string): Promise<void> {
	const supabase = await createTypedServerClient()

	// Get token to revoke
	const tokenData = await getGmailToken(userId)

	if (tokenData) {
		try {
			// Revoke with Google
			oauth2Client.setCredentials({
				access_token: tokenData.access_token,
				refresh_token: tokenData.refresh_token,
			})

			await oauth2Client.revokeCredentials()
		} catch (err) {
			console.error('Failed to revoke with Google:', err)
			// Continue with local revocation even if Google revocation fails
		}
	}

	// Delete from database
	const { error } = await supabase.from('user_oauth_tokens').delete().eq('user_id', userId)

	if (error) {
		throw new Error(`Failed to revoke Gmail token: ${error.message}`)
	}
}

/**
 * Get OAuth2 authorization URL for user consent
 */
export async function getAuthorizationUrl(state: string): Promise<string> {
	const scopes = [
		'https://www.googleapis.com/auth/gmail.readonly',
		'https://www.googleapis.com/auth/gmail.modify',
	]

	return oauth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: scopes,
		state,
		prompt: 'consent', // Force consent screen every time (needed for refresh token)
	})
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(code: string): Promise<GmailTokenData> {
	try {
		const { tokens } = await oauth2Client.getToken(code)

		if (!tokens.access_token) {
			throw new Error('No access token received')
		}

		return {
			access_token: tokens.access_token,
			refresh_token: tokens.refresh_token || undefined,
			expires_at: tokens.expiry_date || Date.now() + 3600 * 1000,
			token_type: tokens.token_type || 'Bearer',
			scope: tokens.scope || 'https://www.googleapis.com/auth/gmail.readonly',
		}
	} catch (err) {
		throw new Error(
			`Failed to exchange code for tokens: ${err instanceof Error ? err.message : 'Unknown error'}`
		)
	}
}
