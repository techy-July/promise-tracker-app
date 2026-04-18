/**
 * Reply Tracker Prompt
 * Instructs Claude to identify items that require a reply
 */

export const REPLY_TRACKER_PROMPT = `You are detecting whether actionable items require the user to reply back to an email.

Email details:
From: {from}
Subject: {subject}

Items extracted:
{items}

For each item, determine:
- Does this require the user to send a reply email?
- What channel should the reply go to? (email to sender, thread, etc.)

Respond with JSON array:
[
  {
    "itemTitle": "string",
    "awaited_reply": boolean,
    "reply_channel_id": "string | null",
    "confidence": number (0.0-1.0)
  }
]

Only respond with valid JSON, no other text.`
