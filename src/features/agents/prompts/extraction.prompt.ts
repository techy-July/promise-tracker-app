/**
 * Extraction Prompt
 * Instructs LLM to extract actionable items from email
 */

// Helper: Get today's date for prompts
function getTodayForPrompt(): string {
	const today = new Date()
	return today.toISOString().split('T')[0]
}

export const EXTRACTION_PROMPT = {
	system:
		'You are an expert at extracting actionable items from emails. Consolidate related items into single tasks. Respond with JSON only.',
	user: (subject: string, from: string, body: string) => {
		const today = getTodayForPrompt()
		return `Extract actionable items, tasks, deadlines, or commitments from this email. IMPORTANT: Consolidate related items - if the same task is mentioned multiple times with different details, merge them into ONE item with all details combined.

Today's date: ${today}

Subject: ${subject}
From: ${from}
Body:
${body}

For due dates, if relative (e.g., "by Friday", "next week", "in 3 days"):
- Calculate the actual date from today (${today})
- Convert to YYYY-MM-DD format
- If no due date mentioned, use null

Respond with ONLY a JSON array (no markdown code blocks), empty array if none found:
[
  {
    "title": "concise task title",
    "description": "detailed context and any additional info",
    "due_date": "2026-04-25 or null",
    "priority": "high|medium|low",
    "confidence": 0.8
  }
]

Rules:
1. Merge duplicate/related tasks - one task per action item
2. Extract actual due dates from text (convert "by Friday" to 2026-04-25)
3. Only include items with confidence > 0.5
4. Title should be 5-10 words max
5. Include ALL relevant info in description`
	},
}
