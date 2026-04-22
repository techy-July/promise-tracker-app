'use client'

import {
	QueryClient,
	QueryClientProvider as TanStackQueryClientProvider,
} from '@tanstack/react-query'
import type { ReactNode } from 'react'

/**
 * Create QueryClient instance with default config
 */
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5, // 5 minutes
			gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
		},
	},
})

/**
 * Wrapper component to provide QueryClient to the app
 * Place this around your app tree to enable TanStack Query
 *
 * Usage:
 * ```typescript
 * // In your app layout or root component
 * <QueryClientProvider>
 *   {children}
 * </QueryClientProvider>
 * ```
 */
export function QueryClientProvider({ children }: { children: ReactNode }) {
	return <TanStackQueryClientProvider client={queryClient}>{children}</TanStackQueryClientProvider>
}
