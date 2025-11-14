import { useState, useMemo, createContext, useContext } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Dot } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { calculateConsistency, getCurrentConsistency, formatTier, getTierColor, type CycleWithDate } from '@/lib/consistencyCalculator';

// Context for chart click handling
const ChartClickContext = createContext<((data: any) => void) | null>(null);

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
  cycleDetails: Array<{ time: string; score: number; timestamp: string }>; // Detailed cycle info
}

// Parse YYYY-MM-DD date string as local date (not UTC)
function parseLocalDate(dateString: string): Date {
  // If it's a YYYY-MM-DD format, parse as local date
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed
  }
  // Otherwise, parse normally (for timestamps)
  return new Date(dateString);
}

// Get local date string (YYYY-MM-DD) from date string or timestamp
function getLocalDateString(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function groupCyclesByDate(cycles: CycleData[]): GroupedCycle[] {
  try {
    const grouped = new Map<string, CycleData[]>();
    
    // Group by calendar date (local timezone)
    for (const cycle of cycles) {
      try {
        const dateStr = cycle.date || cycle.created_at || '';
        if (!dateStr) continue;
        
        // Get local date string (YYYY-MM-DD) in user's timezone
        const calendarDate = getLocalDateString(dateStr);
        
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
          
          const cycleDetails = cycleList
            .filter(c => c.execution_score !== null)
            .map(c => {
              const timestamp = c.created_at || c.date;
              const date = new Date(timestamp);
              const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
              // Get time in minutes since midnight for X-axis
              const minutesSinceMidnight = date.getHours() * 60 + date.getMinutes();
              return {
                time: timeStr,
                score: c.execution_score!,
                timestamp: timestamp,
                minutesSinceMidnight,
              };
            })
            .sort((a, b) => a.minutesSinceMidnight - b.minutesSinceMidnight);
          
          const times = cycleDetails.map(c => c.time);
          
          return {
            date: date,
            cycles: cycleList,
            displayDate: formatDate(date),
            avgScore,
            times,
            cycleDetails,
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
    const date = parseLocalDate(dateString);
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

// Clustered dot component for multiple cycles on same day
function ClusteredDot(props: any) {
  const { cx, cy, payload } = props;
  const handleDotClick = useContext(ChartClickContext);
  
  if (!payload || payload.execution_score === null) {
    return null;
  }
  
  const cycleCount = payload.cycleCount || 1;
  const avgScore = payload.execution_score; // This is already the average score
  const color = getScoreColor(avgScore);
  const cycles = payload.cycles || [];
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (handleDotClick) {
      handleDotClick(payload);
    }
  };
  
  // If single cycle, show simple dot
  if (cycleCount === 1) {
    return (
      <g style={{ cursor: 'pointer' }} onClick={handleClick}>
        <Dot
          cx={cx}
          cy={cy}
          r={5}
          fill={color}
          stroke={color}
          strokeWidth={2}
        />
      </g>
    );
  }
  
  // Multiple cycles: show dots with small offsets
  const maxOffset = 3; // Maximum offset in pixels
  const angleStep = (2 * Math.PI) / cycleCount; // Distribute dots in a circle
  
  return (
    <g style={{ cursor: 'pointer' }} onClick={handleClick}>
      {/* Center aggregate dot with count badge */}
      <Dot
        cx={cx}
        cy={cy}
        r={7}
        fill={color}
        stroke={color}
        strokeWidth={2}
      />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize="9"
        fontWeight="bold"
        pointerEvents="none"
      >
        {cycleCount}
      </text>
      
      {/* Individual cycle dots with small offsets */}
      {cycles.map((cycle: CycleData, index: number) => {
        if (!cycle.execution_score) return null;
        const angle = index * angleStep;
        const offsetX = Math.cos(angle) * maxOffset;
        const offsetY = Math.sin(angle) * maxOffset;
        const cycleColor = getScoreColor(cycle.execution_score);
        
        return (
          <Dot
            key={index}
            cx={cx + offsetX}
            cy={cy + offsetY}
            r={3}
            fill={cycleColor}
            stroke={cycleColor}
            strokeWidth={1.5}
            opacity={0.8}
            pointerEvents="none"
          />
        );
      })}
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

// Day Summary Modal Component (for single cycle days)
function DaySummaryModal({
  open,
  onClose,
  dayData,
  consistencyScore,
  growthAvg,
}: {
  open: boolean;
  onClose: () => void;
  dayData: GroupedCycle | null;
  consistencyScore: number | null;
  growthAvg: number | null;
}) {
  if (!dayData) return null;
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dayData.displayDate}</DialogTitle>
          <DialogDescription>
            Cycle summary
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          {/* Summary Metrics */}
          <div className="space-y-3">
            {consistencyScore !== null && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Consistency:</span>
                <span className="font-semibold" style={{ color: '#22c55e' }}>
                  {consistencyScore.toFixed(1)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Daily Score:</span>
              <span className="font-semibold" style={{ color: '#3b82f6' }}>
                {dayData.avgScore.toFixed(1)}
              </span>
            </div>
            {growthAvg !== null && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Growth (7-day avg):</span>
                <span className="font-semibold" style={{ color: '#8b5cf6' }}>
                  {growthAvg.toFixed(1)}
                </span>
              </div>
            )}
          </div>
          
          {/* Separator */}
          <div className="border-t" />
          
          {/* Cycle Info */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Time:</p>
            <p className="text-sm font-medium">
              {dayData.times[0] || 'N/A'}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Day Detail Modal Component (for multiple cycle days)
function DayDetailModal({ 
  open, 
  onClose, 
  dayData,
  consistencyScore,
  growthAvg,
}: { 
  open: boolean; 
  onClose: () => void; 
  dayData: GroupedCycle | null;
  consistencyScore: number | null;
  growthAvg: number | null;
}) {
  if (!dayData) return null;
  
  // Prepare chart data sorted by time
  const chartData = dayData.cycleDetails
    .sort((a, b) => a.minutesSinceMidnight - b.minutesSinceMidnight)
    .map((cycle) => ({
      time: cycle.minutesSinceMidnight,
      score: cycle.score,
      timeLabel: cycle.time,
    }));
  
  // Format time for X-axis labels
  const formatTimeLabel = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dayData.displayDate}</DialogTitle>
          <DialogDescription>
            {dayData.cycles.length} cycle{dayData.cycles.length !== 1 ? 's' : ''} completed
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          {/* Summary Metrics */}
          <div className="flex flex-wrap gap-4 text-sm">
            {consistencyScore !== null && (
              <div>
                <span className="text-muted-foreground">Consistency: </span>
                <span className="font-semibold" style={{ color: '#22c55e' }}>
                  {consistencyScore.toFixed(1)}
                </span>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Daily Score: </span>
              <span className="font-semibold" style={{ color: '#3b82f6' }}>
                {dayData.avgScore.toFixed(1)}
              </span>
            </div>
            {growthAvg !== null && (
              <div>
                <span className="text-muted-foreground">Growth (7-day avg): </span>
                <span className="font-semibold" style={{ color: '#8b5cf6' }}>
                  {growthAvg.toFixed(1)}
                </span>
              </div>
            )}
          </div>
          
          {/* Separator */}
          <div className="border-t" />
          
          {/* Graph */}
          <div className="w-full h-[200px] sm:h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                type="number"
                dataKey="time"
                domain={['dataMin - 60', 'dataMax + 60']}
                tickFormatter={formatTimeLabel}
                label={{ value: 'Time of Day', position: 'insideBottom', offset: -5 }}
                className="text-xs"
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                domain={[0, 10]}
                label={{ value: 'Score', angle: -90, position: 'insideLeft' }}
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload[0]) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background border border-border rounded-lg p-2 shadow-lg">
                      <p className="text-sm font-semibold">{data.timeLabel}</p>
                      <p className="text-sm">Score: {data.score}</p>
                    </div>
                  );
                }}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                name="Score"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 5, fill: '#3b82f6' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Cycle List */}
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground">
              {dayData.cycles.length} cycle{dayData.cycles.length !== 1 ? 's' : ''}: {dayData.times.join(', ')}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Consistency Detail Modal Component
function ConsistencyDetailModal({
  open,
  onClose,
  consistencyData,
  currentTier,
}: {
  open: boolean;
  onClose: () => void;
  consistencyData: Array<{ date: string; consistencyScore: number; tier: number }>;
  currentTier: number | null;
}) {
  const chartData = consistencyData.map((item) => ({
    date: formatDate(item.date),
    score: item.consistencyScore,
    tier: item.tier,
  }));
  
  const tierDescriptions = [
    { tier: 0, name: 'Tier 0', points: '< 0 points', color: '#ef4444', description: 'Getting started' },
    { tier: 1, name: 'Tier 1', points: '0-2 points', color: '#f97316', description: 'Building momentum' },
    { tier: 2, name: 'Tier 2', points: '2-5 points', color: '#eab308', description: 'Establishing consistency' },
    { tier: 3, name: 'Tier 3', points: '5-10 points', color: '#22c55e', description: 'Strong consistency' },
    { tier: 4, name: 'Tier 4', points: '10+ points', color: '#10b981', description: 'Elite consistency. You are a WayMaker.' },
  ];
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Consistency Score</DialogTitle>
          <DialogDescription>
            Your consistency score over time based on daily participation
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div className="w-full h-[200px] sm:h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                domain={[0, 10]}
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="score" 
                name="Consistency Score"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3 text-foreground">Tier System</h3>
            <div className="space-y-2">
              {tierDescriptions.map((tier) => (
                <div
                  key={tier.tier}
                  className={`flex items-center gap-3 p-2 rounded ${
                    currentTier === tier.tier ? 'bg-muted' : ''
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: tier.color }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{tier.name}</span>
                      {currentTier === tier.tier && (
                        <span className="text-xs text-muted-foreground">(Current)</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {tier.points} - {tier.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Earn +0.1 points per consecutive day, lose -0.3 points per missed day. Only one cycle per calendar day counts toward consistency.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AscentGraph({ data }: AscentGraphProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('7-day');
  const [showDayDetail, setShowDayDetail] = useState(false);
  const [showDaySummary, setShowDaySummary] = useState(false);
  const [showConsistencyDetail, setShowConsistencyDetail] = useState(false);
  const [selectedDayData, setSelectedDayData] = useState<{
    dayData: GroupedCycle;
    consistencyScore: number | null;
    growthAvg: number | null;
  } | null>(null);
  
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
        execution_score: group.avgScore, // Average score for color coding
        cycleCount: group.cycles.length,
        times: group.times,
        displayDate: group.displayDate,
        cycles: group.cycles, // Include cycles for clustered dot
        groupData: group, // Include full group data for modal
      };
    });
  }, [processedData.grouped, growthData, processedData.consistency]);
  
  const handleDotClick = (data: any) => {
    if (data && data.groupData) {
      setSelectedDayData({
        dayData: data.groupData,
        consistencyScore: data.consistency || null,
        growthAvg: data.growth || null,
      });
      
      // Show graph modal for multiple cycles, summary modal for single cycle
      if (data.cycleCount > 1) {
        setShowDayDetail(true);
        setShowDaySummary(false);
      } else {
        setShowDaySummary(true);
        setShowDayDetail(false);
      }
    }
  };
  
  // Handle click on chart area
  const handleChartClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      handleDotClick(data.activePayload[0].payload);
    }
  };
  
  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Journey</CardTitle>
            {currentConsistency && (
              <button
                onClick={() => setShowConsistencyDetail(true)}
                className="text-xs px-2 py-1 rounded-full font-semibold cursor-pointer hover:opacity-80 transition-opacity"
                style={{
                  backgroundColor: getTierColor(currentConsistency.tier) + '20',
                  color: getTierColor(currentConsistency.tier),
                }}
              >
                {formatTier(currentConsistency.tier)}
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p className="text-lg font-semibold">DiRP it up to start your journey!</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Journey</CardTitle>
            {currentConsistency && (
              <button
                onClick={() => setShowConsistencyDetail(true)}
                className="text-xs px-2 py-1 rounded-full font-semibold cursor-pointer hover:opacity-80 transition-opacity"
                style={{
                  backgroundColor: getTierColor(currentConsistency.tier) + '20',
                  color: getTierColor(currentConsistency.tier),
                }}
              >
                {formatTier(currentConsistency.tier)}
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ChartClickContext.Provider value={handleDotClick}>
            <div className="w-full h-[250px] sm:h-[300px] md:h-[350px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={chartData} 
                  margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                  onClick={handleChartClick}
                >
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
                dot={<ClusteredDot />}
                activeDot={{ r: 8 }}
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
            </div>
          </ChartClickContext.Provider>
          
          {/* Time Period Toggle */}
          <div className="flex flex-wrap justify-center gap-2">
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
      
      {/* Day Detail Modal (Multiple Cycles) */}
      <DayDetailModal
        open={showDayDetail}
        onClose={() => {
          setShowDayDetail(false);
          setSelectedDayData(null);
        }}
        dayData={selectedDayData?.dayData || null}
        consistencyScore={selectedDayData?.consistencyScore || null}
        growthAvg={selectedDayData?.growthAvg || null}
      />
      
      {/* Day Summary Modal (Single Cycle) */}
      <DaySummaryModal
        open={showDaySummary}
        onClose={() => {
          setShowDaySummary(false);
          setSelectedDayData(null);
        }}
        dayData={selectedDayData?.dayData || null}
        consistencyScore={selectedDayData?.consistencyScore || null}
        growthAvg={selectedDayData?.growthAvg || null}
      />
      
      {/* Consistency Detail Modal */}
      <ConsistencyDetailModal
        open={showConsistencyDetail}
        onClose={() => setShowConsistencyDetail(false)}
        consistencyData={processedData.consistency}
        currentTier={currentConsistency?.tier ?? null}
      />
    </>
  );
}
