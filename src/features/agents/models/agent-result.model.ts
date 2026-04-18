/**
 * Agent Result - standardized response from all agents
 * Every agent must return this type, never throw
 */
export type AgentResult<T> = {
	success: boolean
	data: T | null
	skipped: boolean // true = stop pipeline for this email
	reason?: string
	tokensUsed?: number
}

/**
 * Helper to create success result
 */
export function agentSuccess<T>(data: T, tokensUsed?: number): AgentResult<T> {
	return {
		success: true,
		data,
		skipped: false,
		tokensUsed,
	}
}

/**
 * Helper to create error result
 */
export function agentError<T>(reason: string, tokensUsed?: number): AgentResult<T> {
	return {
		success: false,
		data: null,
		skipped: false,
		reason,
		tokensUsed,
	}
}

/**
 * Helper to create skipped result
 */
export function agentSkipped<T>(reason: string): AgentResult<T> {
	return {
		success: true,
		data: null,
		skipped: true,
		reason,
	}
}
