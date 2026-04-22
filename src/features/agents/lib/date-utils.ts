/**
 * Date Utilities
 * Parse relative dates and normalize to ISO format
 * IMPORTANT: Uses system's local timezone, so ensure device date/time is correct
 */

/**
 * Get today's date in local timezone (not UTC)
 * Important: Uses system's local time, so ensure device date is correct
 */
function getLocalDate(): Date {
	const now = new Date()
	now.setHours(0, 0, 0, 0) // Reset to start of day

	return now
}

/**
 * Parse email date string to Date object
 * Handles ISO format (2026-04-21T10:00:00Z) and other formats
 */
export function parseEmailDate(dateStr: string | undefined): Date {
	if (!dateStr) {
		const fallback = getLocalDate()
		return fallback
	}

	const parsed = new Date(dateStr)

	if (isNaN(parsed.getTime())) {
		const fallback = getLocalDate()
		return fallback
	}

	// Reset to start of day in local timezone
	const local = new Date(parsed)
	local.setHours(0, 0, 0, 0)

	return local
}

/**
 * Parse relative date strings like "by Friday", "next week", "tomorrow"
 * Returns ISO date string (YYYY-MM-DD) or null if can't parse
 * referenceDate: the email send/received date (defaults to today)
 */
// TODO: update usage of if else
export function parseRelativeDate(
	dateStr: string,
	referenceDate: Date = getLocalDate()
): string | null {
	if (!dateStr) return null

	const lower = dateStr.toLowerCase().trim()
	const now = new Date(referenceDate)
	now.setHours(0, 0, 0, 0) // Reset to start of day

	// Extract day of week patterns: "by Friday", "next Monday", "this Tuesday", etc
	const dayOfWeekMatch = lower.match(
		/(?:by|on|this|next)?\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i
	)
	if (dayOfWeekMatch) {
		const targetDay = dayOfWeekMatch[1].toLowerCase()
		const dayMap: { [key: string]: number } = {
			monday: 1,
			tuesday: 2,
			wednesday: 3,
			thursday: 4,
			friday: 5,
			saturday: 6,
			sunday: 0,
		}

		const target = dayMap[targetDay]
		const current = now.getDay()

		// Calculate days until target day
		let daysToAdd = target - current

		if (daysToAdd <= 0) {
			daysToAdd += 7 // Look for next week's occurrence
		}

		const result = new Date(now)
		result.setDate(result.getDate() + daysToAdd)
		const formatted = formatDate(result)
		return formatted
	}

	// Extract "tomorrow" or "today"
	if (lower.includes('tomorrow')) {
		const tomorrow = new Date(now)
		tomorrow.setDate(tomorrow.getDate() + 1)
		const formatted = formatDate(tomorrow)
		return formatted
	}

	if (lower.includes('today')) {
		const formatted = formatDate(now)
		return formatted
	}

	// Extract "next week" or "this week"
	if (lower.includes('next week')) {
		const nextWeekStart = new Date(now)
		nextWeekStart.setDate(nextWeekStart.getDate() + 7)
		const formatted = formatDate(nextWeekStart)
		return formatted
	}

	if (lower.includes('this week')) {
		const formatted = formatDate(now)
		return formatted
	}

	// Extract explicit dates: "April 25", "4/25", "2026-04-25", etc
	const explicitDateMatch = lower.match(/(\d{1,2})[-/](\d{1,2})(?:[-/](\d{4}))?/)
	if (explicitDateMatch) {
		const month = Number.parseInt(explicitDateMatch[1], 10)
		const day = Number.parseInt(explicitDateMatch[2], 10)
		const year = explicitDateMatch[3]
			? Number.parseInt(explicitDateMatch[3], 10)
			: now.getFullYear()

		const parsed = new Date(year, month - 1, day)

		if (!isNaN(parsed.getTime())) {
			const formatted = formatDate(parsed)
			return formatted
		}
	}

	// Extract "in X days"
	const inDaysMatch = lower.match(/in\s+(\d+)\s+days?/i)
	if (inDaysMatch) {
		const days = Number.parseInt(inDaysMatch[1], 10)
		const result = new Date(now)
		result.setDate(result.getDate() + days)
		const formatted = formatDate(result)
		return formatted
	}

	// Extract "in X weeks"
	const inWeeksMatch = lower.match(/in\s+(\d+)\s+weeks?/i)
	if (inWeeksMatch) {
		const weeks = Number.parseInt(inWeeksMatch[1], 10)
		const result = new Date(now)
		result.setDate(result.getDate() + weeks * 7)
		const formatted = formatDate(result)
		return formatted
	}

	return null
}

/**
 * Format Date to ISO string (YYYY-MM-DD)
 */
export function formatDate(date: Date): string {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	const result = `${year}-${month}-${day}`

	return result
}

/**
 * Get today's date as ISO string
 */
export function getTodayISO(): string {
	const result = formatDate(new Date())
	return result
}

/**
 * Get day name from ISO date string
 */
export function getDayName(dateStr: string): string {
	const date = new Date(dateStr + 'T00:00:00')
	const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
	const dayName = days[date.getDay()]
	return dayName
}
