// Resonance Engine: Keyword matching and relevance scoring
// Simple keyword-based matching for MVP (AI-driven semantic analysis deferred)

interface Improvement {
  id: string;
  improve_text: string;
  execution_score: number | null;
  created_at: string;
}

interface ScoredImprovement extends Improvement {
  relevance_score: number;
}

// Common English stop words to filter out
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'were', 'will', 'with', 'the', 'this', 'these', 'those'
]);

/**
 * Extract keywords from text (simple word-based extraction)
 * - Lowercase, remove punctuation, filter stop words
 */
function extractKeywords(text: string): string[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/) // Split on whitespace
    .filter(word => word.length > 2 && !STOP_WORDS.has(word)) // Filter short words and stop words
    .filter((word, index, arr) => arr.indexOf(word) === index); // Remove duplicates
}

/**
 * Calculate relevance score for an improvement based on commit text
 * Scoring factors:
 * 1. Keyword matches (primary weight)
 * 2. Execution score (higher scores = more relevant)
 * 3. Recency (more recent = slightly more relevant)
 */
export function calculateRelevanceScore(
  improvement: Improvement,
  commitKeywords: string[]
): number {
  if (commitKeywords.length === 0) {
    return 0;
  }

  const improveKeywords = extractKeywords(improvement.improve_text || '');
  
  // Count keyword matches
  const matches = commitKeywords.filter(keyword => 
    improveKeywords.some(improveKeyword => 
      improveKeyword.includes(keyword) || keyword.includes(improveKeyword)
    )
  ).length;

  // Base score from keyword matches (weight: 70%)
  const keywordScore = (matches / commitKeywords.length) * 70;

  // Execution score bonus (weight: 20%)
  // Higher execution scores indicate more successful improvements
  const executionScore = improvement.execution_score !== null 
    ? (improvement.execution_score / 10) * 20 
    : 10; // Default to middle score if null

  // Recency bonus (weight: 10%)
  // More recent improvements are slightly more relevant
  const daysSince = Math.floor(
    (Date.now() - new Date(improvement.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );
  const recencyScore = Math.max(0, 10 - (daysSince / 30) * 10); // Decay over 30 days

  return keywordScore + executionScore + recencyScore;
}

/**
 * Find top N most relevant improvements for a given commit text
 */
export function findRelevantImprovements(
  improvements: Improvement[],
  commitText: string,
  topN: number = 3
): ScoredImprovement[] {
  if (!commitText || commitText.trim().length === 0) {
    return [];
  }

  const commitKeywords = extractKeywords(commitText);
  
  if (commitKeywords.length === 0) {
    return [];
  }

  // Score all improvements
  const scored = improvements.map(improvement => ({
    ...improvement,
    relevance_score: calculateRelevanceScore(improvement, commitKeywords),
  }));

  // Filter out zero-score improvements and sort by relevance
  return scored
    .filter(item => item.relevance_score > 0)
    .sort((a, b) => b.relevance_score - a.relevance_score)
    .slice(0, topN);
}

