/**
 * Validate email date is reasonable
 */
export function validateEmailDate(emailDateStr: string | undefined): {
	isValid: boolean
	emailDate: string
	warning?: string
} {
	if (!emailDateStr) {
		return {
			isValid: false,
			emailDate: 'N/A',
			warning: 'Email date not provided',
		}
	}

	const emailDate = new Date(emailDateStr)
	if (isNaN(emailDate.getTime())) {
		return {
			isValid: false,
			emailDate: emailDateStr,
			warning: 'Email date could not be parsed',
		}
	}

	const systemDate = new Date()
	const daysDiff = Math.abs((systemDate.getTime() - emailDate.getTime()) / (1000 * 60 * 60 * 24))

	let warning: string | undefined
	if (daysDiff > 365) {
		warning = `Email is ${daysDiff.toFixed(0)} days old. Possible data issue?`
	}

	const emailDateStr2 = emailDate.toISOString().split('T')[0]
	return {
		isValid: true,
		emailDate: emailDateStr2,
		warning,
	}
}
