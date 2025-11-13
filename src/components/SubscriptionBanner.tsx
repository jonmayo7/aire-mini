import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthenticatedFetch } from '@/lib/apiClient';

interface SubscriptionBannerProps {
  cyclesCompleted: number;
  cyclesRemaining: number;
  onSubscribe: () => void;
}

export function SubscriptionBanner({ cyclesCompleted, cyclesRemaining, onSubscribe }: SubscriptionBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if banner was dismissed (with expiry)
    const dismissedKey = `subscription-banner-dismissed-${cyclesCompleted}`;
    const dismissed = localStorage.getItem(dismissedKey);
    if (dismissed) {
      setIsDismissed(true);
    }
  }, [cyclesCompleted]);

  const handleDismiss = () => {
    const dismissedKey = `subscription-banner-dismissed-${cyclesCompleted}`;
    localStorage.setItem(dismissedKey, 'true');
    setIsDismissed(true);
  };

  // Show banner when cyclesCompleted >= 10 and cyclesRemaining > 0
  if (isDismissed || cyclesCompleted < 10 || cyclesRemaining <= 0) {
    return null;
  }

  return (
    <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>{cyclesRemaining} cycles remaining</strong> before subscription required. 
              You've completed {cyclesCompleted} cycles so far!
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={onSubscribe}
              size="sm"
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              Subscribe Now
            </Button>
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="text-yellow-800 dark:text-yellow-200 hover:bg-yellow-100 dark:hover:bg-yellow-900/40"
            >
              Dismiss
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

