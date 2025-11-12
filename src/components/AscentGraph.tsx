import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Dot } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { calculateConsistency, getCurrentConsistency, formatTier, getTierColor, type CycleWithDate } from '@/lib/consistencyCalculator';

interface CycleData {
  date: string; // ISO timestamp
  score: number;
  execution_score: number | null;
  created_at?: string; // Full timestamp for micro-cycles
}

interface AscentGraphProps {
  data: CycleData[];
}

type TimePeriod = '7-day' | '30-day' | 'All-time';

// Helper function to get color based on execution score
function getScoreColor(score: number): string {
  if (score >= 1 && score <= 3) {
    return '#ef4444'; // red
  } else if (score >= 4 && score <= 6) {
    return '#eab308'; // yellow
  } else if (score >= 7 && score <= 10) {
    return '#22c55e'; // green
  }
  return '#6b7280'; // gray (fallback)
}

// Helper function to calculate rolling average
function calculateRollingAverage(data: CycleData[], window: number = 7): CycleData[] {
  if (data.length === 0) return [];
  
  const result: CycleData[] = [];
  
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1);
    const windowData = data.slice(start, i + 1).filter(d => d.execution_score !== null);
    
    if (windowData.length > 0) {
      const sum = windowData.reduce((acc, d) => acc + (d.execution_score || 0), 0);
      const avg = sum / windowData.length;
      result.push({
        ...data[i],
        score: avg,
      });
    } else {
      result.push({
        ...data[i],
        score: data[i].score,
      });
    }
  }
  
  return result;
}

// Group cycles by calendar date for micro-cycle visualization
interface GroupedCycle {
  date: string; // Calendar date (YYYY-MM-DD)
  cycles: CycleData[]; // All cycles on this date
  displayDate: string; // Formatted date for display
  avgScore: number; // Average score for the day
  times: string[]; // Times of cycles on this date
}

function groupCyclesByDate(cycles: CycleData[]): GroupedCycle[] {
  try {
    const grouped = new Map<string, CycleData[]>();
    
    // Group by calendar date
    for (const cycle of cycles) {
      try {
        const dateStr = cycle.date || cycle.created_at || '';
        if (!dateStr) continue;
        
        const dateObj = new Date(dateStr);
        if (isNaN(dateObj.getTime())) continue;
        
        const calendarDate = dateObj.toISOString().split('T')[0];
        
        if (!grouped.has(calendarDate)) {
          grouped.set(calendarDate, []);
        }
        grouped.get(calendarDate)!.push(cycle);
      } catch {
        continue; // Skip invalid cycles
      }
    }
    
    // Convert to array and process
    return Array.from(grouped.entries())
      .map(([date, cycleList]) => {
        try {
          const scores = cycleList
            .filter(c => c.execution_score !== null)
            .map(c => c.execution_score!);
          const avgScore = scores.length > 0 
            ? scores.reduce((a, b) => a + b, 0) / scores.length 
            : 0;
          
          const times = cycleList
            .map(c => {
              try {
                const timestamp = c.created_at || c.date;
                if (!timestamp) return '';
                const date = new Date(timestamp);
                if (isNaN(date.getTime())) return '';
                return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
              } catch {
                return '';
              }
            })
            .filter(t => t);
          
          return {
            date: date,
            cycles: cycleList,
            displayDate: formatDate(date),
            avgScore,
            times,
          };
        } catch {
          return null;
        }
      })
      .filter((g): g is GroupedCycle => g !== null)
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Error grouping cycles by date:', error);
    return [];
  }
}

// Format date for display
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  } catch {
    return dateString;
  }
}

// Custom dot component with count badge for micro-cycles
function CustomDot(props: any) {
  const { cx, cy, payload } = props;
  if (!payload || payload.execution_score === null) {
    return null;
  }
  
  const color = getScoreColor(payload.execution_score);
  const cycleCount = payload.cycleCount || 1;
  
  return (
    <g>
      <Dot
        cx={cx}
        cy={cy}
        r={cycleCount > 1 ? 7 : 5}
        fill={color}
        stroke={color}
        strokeWidth={2}
      />
      {cycleCount > 1 && (
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize="10"
          fontWeight="bold"
        >
          {cycleCount}
        </text>
      )}
    </g>
  );
}

// Custom tooltip with micro-cycle time breakdown
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || payload.length === 0) return null;
  
  const data = payload[0].payload;
  const times = data.times || [];
  const cycleCount = data.cycleCount || 1;
  
  return (
    <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
      <p className="font-semibold mb-2">{data.displayDate || data.date}</p>
      {payload.map((entry: any, index: number) => (
        <p key={index} style={{ color: entry.color }} className="text-sm">
          {entry.name}: {entry.value?.toFixed(1) || 'N/A'}
        </p>
      ))}
      {cycleCount > 1 && times.length > 0 && (
        <div className="mt-2 pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {cycleCount} cycles: {times.join(', ')}
          </p>
        </div>
      )}
      {cycleCount === 1 && times.length > 0 && (
        <div className="mt-2 pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Time: {times[0]}
          </p>
        </div>
      )}
    </div>
  );
};

export default function AscentGraph({ data }: AscentGraphProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('7-day');
  
  // Filter and process data based on time period
  const processedData = useMemo(() => {
    try {
      if (!data || data.length === 0) return { filtered: [], grouped: [], consistency: [] };
      
      // Filter by time period
      const now = new Date();
      let cutoffDate: Date;
      
      switch (timePeriod) {
        case '7-day':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30-day':
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'All-time':
          cutoffDate = new Date(0); // Beginning of time
          break;
        default:
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }
    
      const filtered = data
        .filter(d => {
          try {
            if (!d || (!d.date && !d.created_at)) return false;
            const cycleDate = new Date(d.date || d.created_at || '');
            if (isNaN(cycleDate.getTime())) return false;
            return cycleDate >= cutoffDate && d.execution_score !== null;
          } catch {
            return false;
          }
        })
        .sort((a, b) => {
          try {
            const dateA = new Date(a.date || a.created_at || '').getTime();
            const dateB = new Date(b.date || b.created_at || '').getTime();
            if (isNaN(dateA) || isNaN(dateB)) return 0;
            return dateA - dateB;
          } catch {
            return 0;
          }
        });
      
      // Group by date for micro-cycles
      const grouped = groupCyclesByDate(filtered);
      
      // Calculate consistency
      const cyclesForConsistency: CycleWithDate[] = filtered
        .map(d => ({
          created_at: d.date || d.created_at || '',
          execution_score: d.execution_score,
        }))
        .filter(c => c.created_at); // Filter out invalid dates
      
      const startDate = filtered.length > 0 
        ? new Date(filtered[0].date || filtered[0].created_at || '').toISOString().split('T')[0]
        : undefined;
      const endDate = filtered.length > 0
        ? new Date(filtered[filtered.length - 1].date || filtered[filtered.length - 1].created_at || '').toISOString().split('T')[0]
        : undefined;
      
      const consistency = cyclesForConsistency.length > 0 
        ? calculateConsistency(cyclesForConsistency, startDate, endDate)
        : [];
      
      return { filtered, grouped, consistency };
    } catch (error) {
      console.error('Error processing graph data:', error);
      return { filtered: [], grouped: [], consistency: [] };
    }
  }, [data, timePeriod]);
  
  // Calculate rolling average based on time period
  // Use grouped data (one entry per date) for growth calculation
  const windowSize = timePeriod === '7-day' ? 7 : timePeriod === '30-day' ? 30 : processedData.grouped.length;
  const growthData = useMemo(() => {
    // Convert grouped data to CycleData format for rolling average calculation
    const groupedAsCycleData: CycleData[] = processedData.grouped.map(group => ({
      date: group.date,
      created_at: group.date,
      score: group.avgScore,
      execution_score: group.avgScore,
    }));
    return calculateRollingAverage(groupedAsCycleData, windowSize);
  }, [processedData.grouped, windowSize]);
  
  // Get current consistency for badge
  const currentConsistency = useMemo(() => {
    return getCurrentConsistency(processedData.consistency);
  }, [processedData.consistency]);
  
  // Combine data for chart
  const chartData = useMemo(() => {
    return processedData.grouped.map((group, index) => {
      const growthValue = growthData[index]?.score || null;
      const consistencyValue = processedData.consistency.find(c => c.date === group.date);
      
      return {
        date: group.displayDate,
        calendarDate: group.date,
        daily: group.avgScore,
        growth: growthValue,
        consistency: consistencyValue?.consistencyScore || null,
        execution_score: group.avgScore,
        cycleCount: group.cycles.length,
        times: group.times,
        displayDate: group.displayDate,
      };
    });
  }, [processedData.grouped, growthData, processedData.consistency]);
  
  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Journey</CardTitle>
            {currentConsistency && (
              <span
                className="text-xs px-2 py-1 rounded-full font-semibold"
                style={{
                  backgroundColor: getTierColor(currentConsistency.tier) + '20',
                  color: getTierColor(currentConsistency.tier),
                }}
              >
                {formatTier(currentConsistency.tier)}
              </span>
            )}
          </div>
          <CardDescription>View your growth journey overtime, starts after day 2</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>Complete your first cycle to see your journey</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Your Journey</CardTitle>
          {currentConsistency && (
            <span
              className="text-xs px-2 py-1 rounded-full font-semibold"
              style={{
                backgroundColor: getTierColor(currentConsistency.tier) + '20',
                color: getTierColor(currentConsistency.tier),
              }}
            >
              {formatTier(currentConsistency.tier)}
            </span>
          )}
        </div>
        <CardDescription>View your growth journey overtime, starts after day 2</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              domain={[0, 10]}
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="daily" 
              name="Daily Score"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={<CustomDot />}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="growth" 
              name={timePeriod === 'All-time' ? 'Growth (all-time avg)' : `Growth (${windowSize}-day avg)`}
              stroke="#8b5cf6"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="consistency" 
              name="Consistency"
              stroke="#22c55e"
              strokeWidth={2}
              strokeDasharray="3 3"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
        
        {/* Time Period Toggle */}
        <div className="flex justify-center gap-2">
          <Button
            variant={timePeriod === '7-day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimePeriod('7-day')}
          >
            7-day
          </Button>
          <Button
            variant={timePeriod === '30-day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimePeriod('30-day')}
          >
            30-day
          </Button>
          <Button
            variant={timePeriod === 'All-time' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimePeriod('All-time')}
          >
            All-time
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
