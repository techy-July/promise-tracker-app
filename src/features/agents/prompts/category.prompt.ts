/**
 * Category Assignment Prompt
 * Instructs LLM to categorize and assign priority to items
 */

export const CATEGORY_PROMPT = {
	system: 'You are a categorization expert for productivity items. Respond with valid JSON only.',
	user: (
		itemTitles: string[]
	) => `Categorize these items for a productivity tracker - one category per item:

Items:
${itemTitles.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Respond with ONLY a JSON array, one category object per item (no markdown, no extra text):
[
  {
    "category": "work|personal|urgent|follow-up|other",
    "priority": 1
  }
]

Return exactly ${itemTitles.length} objects in the array, matching item order.`,
}
