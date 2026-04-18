/**
 * Extraction Prompt
 * Instructs Claude to extract actionable items from email
 */

export const EXTRACTION_PROMPT = `You are an expert at identifying actionable items in emails.

Analyze the following email and extract all actionable items (tasks, deadlines, commitments, questions requiring response).

Email Subject: {subject}
From: {from}
Body:
{body}

For each actionable item, identify:
- Clear title/action
- Due date (if mentioned)
- Priority (high/medium/low based on urgency markers)
- Confidence (0.0-1.0 how certain you are this is actionable)

Respond with JSON array:
[
  {
    "title": "string",
    "description": "string or null",
    "dueDate": "ISO 8601 or null",
    "priority": "high" | "medium" | "low",
    "confidence": number (0.0-1.0)
  }
]

Return empty array if no actionable items found.
Only respond with valid JSON, no other text.`
