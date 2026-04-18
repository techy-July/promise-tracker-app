/**
 * Spam Filter Prompt
 * Instructs Claude to identify spam/unwanted emails
 */

export const SPAM_FILTER_PROMPT = `You are an email spam classifier.

Analyze the following email and determine if it should be filtered as spam or unwanted.

Email Subject: {subject}
From: {from}
Body:
{body}

Consider:
- Marketing emails
- Newsletters (if user hasn't indicated interest)
- Known spam patterns
- Suspicious links or requests

Respond with JSON:
{
  "isSpam": boolean,
  "reason": string
}

Only respond with valid JSON, no other text.`
