/**
 * Category Assignment Prompt
 * Instructs Claude to assign items to user categories
 */

export const CATEGORY_PROMPT = `You are helping organize actionable items into user-defined categories.

Available categories:
{categories}

For each item, determine the best matching category or null if none fit.

Items to categorize:
{items}

Respond with JSON array matching input order:
[
  {
    "itemTitle": "string",
    "categoryId": "string | null",
    "confidence": number (0.0-1.0)
  }
]

Only respond with valid JSON, no other text.`
