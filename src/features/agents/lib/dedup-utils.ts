/**
 * Deduplication Utilities
 * Detect and merge duplicate/similar tasks
 */
// TODO: This is a duplicate interface declaration from extraction.agent.ts - should be moved to a shared models file
export interface TrackableItemDraft {
	title: string
	description?: string
	due_date?: string | null
	priority: 'high' | 'medium' | 'low'
	confidence: number
}

/**
 * Calculate similarity score between two strings (0-1)
 * Uses simple word overlap + length ratio approach
 */
export function calculateSimilarity(str1: string, str2: string): number {
	if (!str1 || !str2) return 0

	const s1 = str1.toLowerCase().trim()
	const s2 = str2.toLowerCase().trim()

	// Exact match
	if (s1 === s2) return 1

	// Levenshtein-like distance (simplified)
	const len1 = s1.length
	const len2 = s2.length
	const maxLen = Math.max(len1, len2)
	const minLen = Math.min(len1, len2)

	// Length ratio (if very different lengths, less likely to be duplicates)
	const lengthRatio = minLen / maxLen

	// Word overlap
	const words1 = new Set(s1.split(/\s+/))
	const words2 = new Set(s2.split(/\s+/))
	const intersection = [...words1].filter((w) => words2.has(w))
	const union = new Set([...words1, ...words2])

	const wordOverlap = intersection.length / union.size

	// Combined score: weight length ratio and word overlap
	const similarity = lengthRatio * 0.3 + wordOverlap * 0.7

	return similarity
}

/**
 * Detect duplicate items and merge them
 * Returns deduplicated array with merged items
 */
export function deduplicateItems(items: TrackableItemDraft[]): TrackableItemDraft[] {
	const SIMILARITY_THRESHOLD = 0.6 // Items > 60% similar are considered duplicates

	if (items.length <= 1) return items

	const deduplicated: TrackableItemDraft[] = []
	const merged = new Set<number>() // Track which items have been merged

	for (let i = 0; i < items.length; i++) {
		if (merged.has(i)) continue

		const current = { ...items[i] }
		let mergedCount = 1

		// Find similar items to merge with
		for (let j = i + 1; j < items.length; j++) {
			if (merged.has(j)) continue

			const similarity = calculateSimilarity(current.title, items[j].title)

			if (similarity >= SIMILARITY_THRESHOLD) {
				// Merge items[j] into current
				merged.add(j)
				mergedCount++

				// Keep the higher confidence
				if (items[j].confidence > current.confidence) {
					current.confidence = items[j].confidence
				}

				// Merge descriptions (concatenate if both exist)
				if (items[j].description && !current.description) {
					current.description = items[j].description
				} else if (items[j].description && current.description) {
					current.description = `${current.description} | ${items[j].description}`
				}

				// Use earliest due date if both exist
				if (
					items[j].due_date &&
					typeof items[j].due_date === 'string' &&
					current.due_date &&
					typeof current.due_date === 'string'
				) {
					if (new Date(items[j].due_date as string) < new Date(current.due_date as string)) {
						current.due_date = items[j].due_date
					}
				} else if (items[j].due_date && typeof items[j].due_date === 'string') {
					current.due_date = items[j].due_date
				}
			}
		}

		deduplicated.push(current)
	}

	return deduplicated
}

/**
 * Format deduplication result for logging
 */
export function logDeduplicationResult(
	before: TrackableItemDraft[],
	after: TrackableItemDraft[]
): void {
	const reduced = before.length - after.length
	if (reduced > 0) {
		console.log(`[DEDUP] Merged ${reduced} duplicate item(s)`)
		after.forEach((item, i) => {
			console.log(`[DEDUP]   ${i + 1}. "${item.title}" (confidence: ${item.confidence.toFixed(2)})`)
		})
	}
}
