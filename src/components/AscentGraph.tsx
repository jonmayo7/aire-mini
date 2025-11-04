import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Dot } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface CycleData {
  date: string;
  score: number;
  execution_score: number | null;
}

interface AscentGraphProps {
  data: CycleData[];
}

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

// Helper function to calculate 7-day rolling average
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

// Custom dot component for Daily Line with color coding
function CustomDot(props: any) {
  const { cx, cy, payload } = props;
  if (!payload || payload.execution_score === null) {
    return null;
  }
  
  const color = getScoreColor(payload.execution_score);
  
  return (
    <Dot
      cx={cx}
      cy={cy}
      r={5}
      fill={color}
      stroke={color}
      strokeWidth={2}
    />
  );
}

// Format date for display
function formatDate(dateString: string): string {
  const date = new Date(dateString);
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
}

export default function AscentGraph({ data }: AscentGraphProps) {
  // Filter out entries without execution_score for Daily Line
  const dailyData = useMemo(() => {
    return data
      .filter(d => d.execution_score !== null)
      .map(d => ({
        ...d,
        score: d.execution_score!,
      }))
      .reverse(); // Reverse to show oldest first (left to right)
  }, [data]);
  
  // Calculate rolling average for Ascent Line (working with sorted data)
  const ascentData = useMemo(() => {
    return calculateRollingAverage(dailyData, 7);
  }, [dailyData]);
  
  // Combine data for chart (both lines need same x-axis points)
  const chartData = useMemo(() => {
    return dailyData.map((d, index) => {
      const ascentValue = ascentData[index]?.score || null;
      return {
        date: formatDate(d.date),
        daily: d.score,
        ascent: ascentValue,
        execution_score: d.execution_score,
      };
    });
  }, [dailyData, ascentData]);
  
  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ascent Graph</CardTitle>
          <CardDescription>Your execution score over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>Complete your first cycle to see your ascent</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ascent Graph</CardTitle>
        <CardDescription>Your execution score over time</CardDescription>
      </CardHeader>
      <CardContent>
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
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
            />
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
              dataKey="ascent" 
              name="Ascent (7-day avg)"
              stroke="#8b5cf6"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

