/**
 * Gmail OAuth token data
 */
export interface GmailTokenData {
	access_token: string
	refresh_token?: string
	expires_at: number // Timestamp when token expires
	token_type: string
	scope: string
}

/**
 * Gmail message wrapper (from Gmail API)
 */
export interface GmailMessage {
	id: string
	threadId: string
	labelIds?: string[]
	snippet?: string
	historyId?: string
	internalDate?: string
	payload?: {
		headers?: Array<{ name: string; value: string }>
		mimeType?: string
		parts?: any[]
		body?: { data?: string }
	}
}

/**
 * Gmail watch state
 */
export interface GmailWatchState {
	userId: string
	historyId: string
	watchExpireTime?: number
}
