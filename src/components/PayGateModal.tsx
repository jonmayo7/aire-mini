import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuthenticatedFetch } from '@/lib/apiClient';

interface PayGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  cyclesCompleted: number;
  cyclesRemaining: number;
}

export function PayGateModal({ isOpen, onClose, cyclesCompleted, cyclesRemaining }: PayGateModalProps) {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authenticatedFetch('/api/subscriptions/create-checkout', {
        method: 'POST',
        body: JSON.stringify({ plan: 'monthly' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const data = await response.json();
      
      // Redirect to Stripe Checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err: any) {
      console.error('Error creating checkout session:', err);
      setError(err.message || 'Failed to start checkout process');
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Subscription Required</DialogTitle>
          <DialogDescription>
            You've completed {cyclesCompleted} cycles. Subscribe to continue your DiRP journey.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="p-4 border-2 border-primary rounded-lg bg-primary/5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-foreground">Monthly Subscription</h3>
              <span className="text-lg font-bold text-foreground">$9/month</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Continue your DiRP journey with unlimited cycles
            </p>
            <Button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? 'Loading...' : 'Subscribe Now'}
            </Button>
          </div>

          <div className="pt-2 border-t border-border">
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full"
              disabled={isLoading}
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

