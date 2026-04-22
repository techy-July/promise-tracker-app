import axios from 'axios'

/**
 * Configured axios instance for API calls
 * Handles base URL, headers, and response interceptors
 */
export const axiosInstance = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '',
	timeout: 30000,
})

/**
 * Add user ID header to all requests
 */
export function setUserIdHeader(userId: string) {
	axiosInstance.defaults.headers.common['x-user-id'] = userId
}

/**
 * Clear user ID header
 */
export function clearUserIdHeader() {
	delete axiosInstance.defaults.headers.common['x-user-id']
}

export default axiosInstance
