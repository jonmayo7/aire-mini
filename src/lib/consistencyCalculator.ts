/**
 * Consistency Calculator
 * Calculates consistency scores based on daily participation streaks
 * Safeguards: Only one cycle per calendar day counts for consistency points
 */

export interface CycleWithDate {
  created_at: string;
  execution_score: number | null;
}

export interface ConsistencyData {
  date: string; // ISO date string (YYYY-MM-DD)
  consistencyScore: number; // 0-10 scale
  tier: number; // 0-4
  totalPoints: number;
  streakDays: number;
}

// Tier thresholds
const TIER_THRESHOLDS = {
  TIER_0: 0,
  TIER_1: 2,
  TIER_2: 5,
  TIER_3: 10,
  TIER_4: Infinity,
};

// Points per action
const POINTS_PER_DAY = 0.1;
const POINTS_PER_MISS = -0.3;

/**
 * Extract calendar date (YYYY-MM-DD) from timestamp
 */
function getCalendarDate(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toISOString().split('T')[0];
}

/**
 * Get all calendar dates between start and end (inclusive)
 */
function getDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const current = new Date(start);
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

/**
 * Group cycles by calendar date (one cycle per day for consistency calculation)
 */
function groupCyclesByDate(cycles: CycleWithDate[]): Map<string, CycleWithDate[]> {
  const grouped = new Map<string, CycleWithDate[]>();
  
  for (const cycle of cycles) {
    const date = getCalendarDate(cycle.created_at);
    if (!grouped.has(date)) {
      grouped.set(date, []);
    }
    grouped.get(date)!.push(cycle);
  }
  
  return grouped;
}

/**
 * Determine tier based on total points
 */
function getTier(points: number): number {
  if (points < TIER_THRESHOLDS.TIER_1) return 0;
  if (points < TIER_THRESHOLDS.TIER_2) return 1;
  if (points < TIER_THRESHOLDS.TIER_3) return 2;
  if (points < TIER_THRESHOLDS.TIER_4) return 3;
  return 4;
}

/**
 * Calculate consistency score (0-10) based on tier and streak
 */
function calculateConsistencyScore(tier: number, streakDays: number): number {
  // Base score from tier (0-4 maps to 0-4 points)
  const tierScore = tier;
  
  // Streak bonus (max 6 points for very long streaks)
  const streakBonus = Math.min(streakDays * 0.1, 6);
  
  // Total score capped at 10
  return Math.min(tierScore + streakBonus, 10);
}

/**
 * Calculate consistency data for all dates in the range
 */
export function calculateConsistency(
  cycles: CycleWithDate[],
  startDate?: string,
  endDate?: string
): ConsistencyData[] {
  if (cycles.length === 0) {
    return [];
  }

  // Group cycles by calendar date (safeguard: one per day)
  const groupedByDate = groupCyclesByDate(cycles);
  
  // Get unique calendar dates (one per day, regardless of multiple cycles)
  const uniqueDates = Array.from(groupedByDate.keys()).sort();
  
  // Determine date range
  const firstDate = startDate || uniqueDates[0];
  const lastDate = endDate || uniqueDates[uniqueDates.length - 1];
  const allDates = getDateRange(firstDate, lastDate);
  
  // Calculate consistency for each date
  const result: ConsistencyData[] = [];
  let totalPoints = 0;
  let currentStreak = 0;
  
  for (const date of allDates) {
    const hasCycle = groupedByDate.has(date);
    
    if (hasCycle) {
      // Earn points for this day (only once per calendar day)
      totalPoints += POINTS_PER_DAY;
      currentStreak += 1;
    } else {
      // Lose points for missed day
      totalPoints += POINTS_PER_MISS;
      currentStreak = 0; // Reset streak on miss
    }
    
    // Ensure points don't go below 0 (optional safeguard)
    totalPoints = Math.max(0, totalPoints);
    
    const tier = getTier(totalPoints);
    const consistencyScore = calculateConsistencyScore(tier, currentStreak);
    
    result.push({
      date,
      consistencyScore,
      tier,
      totalPoints,
      streakDays: currentStreak,
    });
  }
  
  return result;
}

/**
 * Get current consistency metrics (latest date)
 */
export function getCurrentConsistency(consistencyData: ConsistencyData[]): {
  tier: number;
  score: number;
  streakDays: number;
  totalPoints: number;
} | null {
  if (consistencyData.length === 0) {
    return null;
  }
  
  const latest = consistencyData[consistencyData.length - 1];
  return {
    tier: latest.tier,
    score: latest.consistencyScore,
    streakDays: latest.streakDays,
    totalPoints: latest.totalPoints,
  };
}

/**
 * Format tier name for display
 */
export function formatTier(tier: number): string {
  return `Tier ${tier}`;
}

/**
 * Get tier color for display
 */
export function getTierColor(tier: number): string {
  const colors = [
    '#ef4444', // Tier 0 - red
    '#f97316', // Tier 1 - orange
    '#eab308', // Tier 2 - yellow
    '#22c55e', // Tier 3 - green
    '#10b981', // Tier 4 - emerald
  ];
  return colors[Math.min(tier, 4)] || '#6b7280';
}

