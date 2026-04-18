/**
 * Format date for display
 */
export function formatDate(date: string | null): string {
	if (!date) return ''
	return new Date(date).toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	})
}

/**
 * Determine if item is overdue
 */
export function isOverdue(dueDate: string | null): boolean {
	if (!dueDate) return false
	return new Date(dueDate) < new Date()
}
