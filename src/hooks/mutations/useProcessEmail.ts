'use client'

import type { UseMutationOptions } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
import { axiosInstance, setUserIdHeader } from '@/lib/api/axios-instance'
import type { EmailPayloadRequest, ProcessEmailResponse } from '@/lib/api/types'

/**
 * Mutation hook for processing emails
 * Handles all client-side API communication for email processing
 *
 * Usage:
 * ```typescript
 * const { mutate, isPending, isError, error } = useProcessEmail({
 *   onSuccess: (data) => console.log('Processed:', data),
 *   onError: (error) => console.error('Failed:', error),
 * })
 */
export function useProcessEmail(
	userId: string,
	options?: UseMutationOptions<ProcessEmailResponse, Error, EmailPayloadRequest>
) {
	return useMutation({
		mutationFn: async (emailPayload: EmailPayloadRequest) => {
			// Set user ID header
			setUserIdHeader(userId)

			try {
				const response = await axiosInstance.post<ProcessEmailResponse>(
					'/api/agents/process',
					emailPayload
				)
				return response.data
			} catch (error: any) {
				// Extract error message from response if available
				const message =
					error.response?.data?.details ||
					error.response?.data?.error ||
					error.message ||
					'Failed to process email'

				throw new Error(message)
			}
		},
		...options,
	})
}
