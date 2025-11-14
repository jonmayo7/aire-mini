import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthenticatedFetch } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UserPreferences {
  id?: string;
  email?: string;
  phone?: string;
  preferred_notification_time?: string;
  notification_method?: 'email' | 'sms' | 'both';
}

export default function OnboardingScreen() {
  const navigate = useNavigate();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notificationTime, setNotificationTime] = useState('09:00');
  const [notificationMethod, setNotificationMethod] = useState<'email' | 'sms' | 'both'>('email');

  // Fetch existing preferences on mount
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await authenticatedFetch('/api/user/preferences', {
          method: 'GET',
        });

        if (!response.ok) {
          if (response.status === 401) {
            navigate('/auth', { replace: true });
            return;
          }
          // If error, continue with empty form
          console.error('Failed to fetch preferences');
        } else {
          const data = await response.json();
          if (data.preferences) {
            setEmail(data.preferences.email || '');
            setPhone(data.preferences.phone || '');
            setNotificationTime(data.preferences.preferred_notification_time || '09:00');
            setNotificationMethod(data.preferences.notification_method || 'email');
          }
        }
      } catch (err: any) {
        console.error('Error fetching preferences:', err);
        if (err.message.includes('No active session')) {
          navigate('/auth', { replace: true });
          return;
        }
        // Continue with empty form on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, [authenticatedFetch, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    // Validation: At least one contact method required
    if (!email && !phone) {
      setError('Please provide at least one contact method (email or phone)');
      setIsSaving(false);
      return;
    }

    try {
      const response = await authenticatedFetch('/api/user/preferences', {
        method: 'POST',
        body: JSON.stringify({
          email: email || null,
          phone: phone || null,
          preferred_notification_time: notificationTime,
          notification_method: notificationMethod,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/auth', { replace: true });
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save preferences');
      }

      // Success - navigate to dashboard
      navigate('/', { replace: true });
    } catch (err: any) {
      console.error('Error saving preferences:', err);
      if (err.message.includes('No active session')) {
        navigate('/auth', { replace: true });
        return;
      }
      setError(err.message || 'Failed to save preferences');
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    navigate('/', { replace: true });
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

  return (
    <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Set Up Your Daily Reminders</CardTitle>
          <CardDescription>
            Help us keep you engaged by setting up your notification preferences. We'll send you a reminder when it's time for your next cycle.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1234567890"
              />
            </div>

            {/* Notification Time */}
            <div className="space-y-2">
              <Label htmlFor="notification-time">Preferred Notification Time</Label>
              <Input
                id="notification-time"
                type="time"
                value={notificationTime}
                onChange={(e) => setNotificationTime(e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">
                We'll send you a reminder at this time each day
              </p>
            </div>

            {/* Notification Method */}
            <div className="space-y-2">
              <Label>Notification Method</Label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="notification-method"
                    value="email"
                    checked={notificationMethod === 'email'}
                    onChange={(e) => setNotificationMethod(e.target.value as 'email')}
                    className="w-4 h-4"
                  />
                  <span>Email</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="notification-method"
                    value="both"
                    checked={notificationMethod === 'both'}
                    onChange={(e) => setNotificationMethod(e.target.value as 'both')}
                    className="w-4 h-4"
                  />
                  <span>Email & SMS (if phone provided)</span>
                </label>
              </div>
              {notificationMethod === 'both' && phone && (
                <p className="text-sm text-muted-foreground mt-2">
                  By opting into SMS, you agree to our{' '}
                  <a href="#/privacy" className="text-primary underline hover:text-primary/80">
                    Privacy Policy
                  </a>{' '}
                  and{' '}
                  <a href="#/terms" className="text-primary underline hover:text-primary/80">
                    Terms of Service
                  </a>
                  . Message and data rates may apply. Reply STOP to unsubscribe.
                </p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button
                type="button"
                onClick={handleSkip}
                variant="outline"
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                Skip for Now
              </Button>
              <Button
                type="submit"
                disabled={isSaving || (!email && !phone)}
                size="lg"
                className="w-full sm:flex-1"
              >
                {isSaving ? 'Saving...' : 'Save Preferences'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

