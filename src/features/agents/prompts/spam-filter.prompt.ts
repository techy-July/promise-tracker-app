/**
 * Spam Filter Prompt
 * Instructs LLM to identify spam/unwanted emails
 */

export const SPAM_FILTER_PROMPT = {
	system: 'You are a spam detection expert. Respond with JSON only.',
	user: (subject: string, from: string, bodyPreview: string) => `Analyze this email for spam:

Subject: ${subject}
From: ${from}
Preview: ${bodyPreview}

Respond with ONLY a JSON object (no markdown):
{
  "isLegitimate": boolean,
  "confidence": number (0-1),
  "reason": string
}`,
}
