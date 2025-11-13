import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthenticatedFetch } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface Cycle {
  id: string;
  cycle_date: string;
  execution_score: number | null;
  improve_text: string | null;
  commit_text: string | null;
  prime_text: string | null;
  created_at: string;
}

interface GroupedCycle {
  date: string; // YYYY-MM-DD format
  cycles: Cycle[];
  displayDate: string;
}

type ViewType = 'all' | 'prime' | 'improve' | 'commit';

export default function DiRPLogScreen() {
  const navigate = useNavigate();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewType>('all');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [keywordSearch, setKeywordSearch] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<GroupedCycle | null>(null);
  const [isDayDetailOpen, setIsDayDetailOpen] = useState(false);

  useEffect(() => {
    const fetchCycles = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await authenticatedFetch('/api/cycles/history', {
          method: 'GET',
        });

        if (!response.ok) {
          if (response.status === 401) {
            navigate('/auth', { replace: true });
            return;
          }
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch cycles');
        }

        const data = await response.json();
        setCycles(data.cycles || []);
      } catch (err: any) {
        console.error('Error fetching cycles:', err);
        if (err.message.includes('No active session')) {
          navigate('/auth', { replace: true });
          return;
        }
        setError(err.message || 'Failed to load cycles');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCycles();
  }, [authenticatedFetch, navigate]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Filter cycles based on active view
  const filteredCycles = useMemo(() => {
    let filtered = cycles;

    // Filter by view type
    if (activeView === 'prime') {
      filtered = filtered.filter(c => c.prime_text && c.prime_text.trim().length > 0);
    } else if (activeView === 'improve') {
      filtered = filtered.filter(c => c.improve_text && c.improve_text.trim().length > 0);
    } else if (activeView === 'commit') {
      filtered = filtered.filter(c => c.commit_text && c.commit_text.trim().length > 0);
    }

    // Filter by date range search
    if (startDate || endDate) {
      filtered = filtered.filter(c => {
        const cycleDate = new Date(c.cycle_date);
        cycleDate.setHours(0, 0, 0, 0); // Reset time to start of day
        
        if (startDate && endDate) {
          // Both dates selected - range
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999); // End of day
          return cycleDate >= start && cycleDate <= end;
        } else if (startDate) {
          // Only start date selected - treat as single date
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(startDate);
          end.setHours(23, 59, 59, 999);
          return cycleDate >= start && cycleDate <= end;
        }
        return false;
      });
    }

    // Filter by keyword search
    if (keywordSearch.trim()) {
      const searchLower = keywordSearch.toLowerCase();
      const searchNumber = parseInt(keywordSearch.trim(), 10);
      const isNumericSearch = !isNaN(searchNumber) && searchNumber >= 0 && searchNumber <= 10;
      
      filtered = filtered.filter(c => {
        // Check score match if numeric search
        const scoreMatch = isNumericSearch && c.execution_score !== null && c.execution_score === searchNumber;
        
        if (activeView === 'all') {
          // Search all text fields and score
          return (
            scoreMatch ||
            (c.prime_text && c.prime_text.toLowerCase().includes(searchLower)) ||
            (c.improve_text && c.improve_text.toLowerCase().includes(searchLower)) ||
            (c.commit_text && c.commit_text.toLowerCase().includes(searchLower))
          );
        } else if (activeView === 'prime') {
          return scoreMatch || (c.prime_text && c.prime_text.toLowerCase().includes(searchLower));
        } else if (activeView === 'improve') {
          return scoreMatch || (c.improve_text && c.improve_text.toLowerCase().includes(searchLower));
        } else if (activeView === 'commit') {
          return scoreMatch || (c.commit_text && c.commit_text.toLowerCase().includes(searchLower));
        }
        return false;
      });
    }

    return filtered;
  }, [cycles, activeView, startDate, endDate, keywordSearch]);

  // Group cycles by date
  const groupedCycles = useMemo(() => {
    const grouped = new Map<string, Cycle[]>();
    
    filteredCycles.forEach(cycle => {
      const dateKey = cycle.cycle_date; // Already in YYYY-MM-DD format
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(cycle);
    });

    return Array.from(grouped.entries())
      .map(([date, cycleList]) => {
        // Sort cycles by created_at (chronologically)
        const sortedCycles = cycleList.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        
        return {
          date,
          cycles: sortedCycles,
          displayDate: formatDate(date),
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Newest first
  }, [filteredCycles]);

  const handleDayClick = (groupedCycle: GroupedCycle) => {
    if (groupedCycle.cycles.length > 1) {
      setSelectedDay(groupedCycle);
      setIsDayDetailOpen(true);
    }
  };

  const renderVisualizeCard = (cycle: Cycle, showDate: boolean = false) => {
    return (
      <Card key={cycle.id} className="border-l-4 border-l-primary">
        <CardContent className="p-4">
          {showDate && (
            <div className="flex justify-between items-start mb-3 pb-2 border-b border-border">
              <p className="text-sm font-medium text-muted-foreground">
                {formatDate(cycle.created_at)}
              </p>
              <p className="text-sm font-medium text-muted-foreground">
                {formatTime(cycle.created_at)}
              </p>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Prime</p>
              <p className="text-base text-foreground whitespace-pre-wrap">
                {cycle.prime_text || '(Not set)'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Improve</p>
              <p className="text-base text-foreground whitespace-pre-wrap">
                {cycle.improve_text || '(Not set)'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Score</p>
              <p className="text-base text-foreground">
                {cycle.execution_score !== null ? `${cycle.execution_score}/10` : '(Not set)'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Commit</p>
              <p className="text-base text-foreground whitespace-pre-wrap">
                {cycle.commit_text || '(Not set)'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSubcategoryCard = (cycle: Cycle, field: 'prime' | 'improve' | 'commit') => {
    const fieldText = field === 'prime' ? cycle.prime_text : 
                     field === 'improve' ? cycle.improve_text : 
                     cycle.commit_text;
    const fieldLabel = field === 'prime' ? 'Prime' : 
                      field === 'improve' ? 'Improve' : 
                      'Commit';

    return (
      <Card key={cycle.id} className="border-l-4 border-l-primary">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium text-muted-foreground">
              {formatDate(cycle.created_at)}
            </p>
            {cycle.execution_score !== null && (
              <p className="text-sm font-medium text-foreground">
                Score: {cycle.execution_score}/10
              </p>
            )}
          </div>
          <p className="text-base text-foreground whitespace-pre-wrap">
            {fieldText || `(${fieldLabel} not set)`}
          </p>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto">
        <Card>
          <CardContent className="flex justify-center items-center h-48">
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto">
        <Card>
          <CardContent className="flex flex-col gap-4 p-6">
            <p className="text-destructive">{error}</p>
            <Button onClick={() => navigate('/')} variant="outline">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>DiRP Log</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* View Tabs */}
          <div className="flex gap-2 border-b border-border pb-2">
            <Button
              variant={activeView === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('all')}
            >
              All DiRPs
            </Button>
            <Button
              variant={activeView === 'prime' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('prime')}
            >
              Prime Log
            </Button>
            <Button
              variant={activeView === 'improve' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('improve')}
            >
              Improve Log
            </Button>
            <Button
              variant={activeView === 'commit' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('commit')}
            >
              Commit Log
            </Button>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <DatePicker
                selectsRange
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => {
                  setDateRange(update as [Date | null, Date | null]);
                }}
                isClearable
                placeholderText="Select date or date range"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                wrapperClassName="w-full"
              />
            </div>
            <Input
              type="text"
              value={keywordSearch}
              onChange={(e) => setKeywordSearch(e.target.value)}
              placeholder={`Search by keyword${activeView === 'all' ? ' (all fields)' : ''}`}
              className="text-foreground bg-background"
            />
          </div>

          {/* Results */}
          {groupedCycles.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {keywordSearch || startDate || endDate
                ? 'No cycles found matching your search.' 
                : 'No cycles logged yet. Complete a cycle to see your progress.'}
            </p>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {groupedCycles.map((groupedCycle) => {
                if (activeView === 'all') {
                  // Show visualize-style cards for "All DiRPs" view
                  if (groupedCycle.cycles.length === 1) {
                    // Single cycle - show directly
                    return renderVisualizeCard(groupedCycle.cycles[0], true);
                  } else {
                    // Multiple cycles - show first one with indicator, clickable with stacked effect
                    return (
                      <div key={groupedCycle.date} className="relative">
                        {/* Stacked card effect */}
                        {groupedCycle.cycles.length > 1 && (
                          <div className="absolute top-2 right-2 w-full h-full bg-card border border-border rounded-md opacity-30 -z-10 transform translate-x-1 translate-y-1" />
                        )}
                        <Card 
                          className="border-l-4 border-l-primary cursor-pointer hover:bg-accent/50 transition-colors relative z-0"
                          onClick={() => handleDayClick(groupedCycle)}
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center mb-3 pb-2 border-b border-border">
                              <p className="text-sm font-medium text-muted-foreground">
                                {groupedCycle.displayDate}
                              </p>
                              <span className="px-2 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                                {groupedCycle.cycles.length} cycles
                              </span>
                            </div>
                            {renderVisualizeCard(groupedCycle.cycles[0], false)}
                            <div className="mt-3 pt-3 border-t border-border">
                              <p className="text-xs text-muted-foreground text-center">
                                Click to view all {groupedCycle.cycles.length} cycles
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  }
                } else {
                  // Subcategory views - show all cycles for the day
                  return (
                    <div key={groupedCycle.date}>
                      {groupedCycle.cycles.length > 1 && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-muted-foreground">
                            {groupedCycle.displayDate} ({groupedCycle.cycles.length} cycles)
                          </p>
                        </div>
                      )}
                      <div className="space-y-2">
                        {groupedCycle.cycles.map(cycle => 
                          renderSubcategoryCard(cycle, activeView as 'prime' | 'improve' | 'commit')
                        )}
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          )}

          <Button onClick={() => navigate('/')} variant="outline" className="mt-4">
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>

      {/* Day Detail Dialog for multi-cycle days */}
      <Dialog open={isDayDetailOpen} onOpenChange={setIsDayDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {selectedDay?.displayDate} - {selectedDay?.cycles.length} cycles
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedDay?.cycles.map(cycle => renderVisualizeCard(cycle, true))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

