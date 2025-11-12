import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseClient } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/authContext';
import { useTheme } from '@/lib/themeContext';
import { useAuthenticatedFetch } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function ProfileScreen() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { theme, setTheme } = useTheme();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Fetch existing theme preference from API on mount
  useEffect(() => {
    const fetchThemePreference = async () => {
      try {
        const response = await authenticatedFetch('/api/user/preferences', {
          method: 'GET',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.preferences?.theme_preference) {
            setTheme(data.preferences.theme_preference as 'light' | 'dark' | 'system');
          }
        }
      } catch (err) {
        // Silently fail - use localStorage fallback
        console.error('Error fetching theme preference:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchThemePreference();
  }, [authenticatedFetch, setTheme]);

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    const previousTheme = theme;
    setTheme(newTheme);
    setIsSaving(true);
    setError(null);
    setSaveMessage(null);

    try {
      const response = await authenticatedFetch('/api/user/preferences', {
        method: 'POST',
        body: JSON.stringify({
          theme_preference: newTheme,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/auth', { replace: true });
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save theme preference');
      }

      setSaveMessage('Theme preference saved');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      console.error('Error saving theme preference:', err);
      if (err.message.includes('No active session')) {
        navigate('/auth', { replace: true });
        return;
      }
      setError(err.message || 'Failed to save theme preference');
      // Revert to previous theme on error
      setTheme(previousTheme);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabaseClient.auth.signOut();
    navigate('/auth', { replace: true });
  };

  const handleViewNotifications = () => {
    navigate('/onboarding');
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

  const userEmail = session?.user?.email || 'Not available';

  return (
    <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Profile & Settings</CardTitle>
          <CardDescription>
            Manage your account preferences and settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Info */}
          <div className="space-y-2">
            <Label>Email</Label>
            <p className="text-sm text-muted-foreground">{userEmail}</p>
          </div>

          {/* Theme Selection */}
          <div className="space-y-3">
            <Label>Theme</Label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={theme === 'light'}
                  onChange={() => handleThemeChange('light')}
                  disabled={isSaving}
                  className="w-4 h-4"
                />
                <span>Light</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={theme === 'dark'}
                  onChange={() => handleThemeChange('dark')}
                  disabled={isSaving}
                  className="w-4 h-4"
                />
                <span>Dark</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value="system"
                  checked={theme === 'system'}
                  onChange={() => handleThemeChange('system')}
                  disabled={isSaving}
                  className="w-4 h-4"
                />
                <span>System (follows your device setting)</span>
              </label>
            </div>
          </div>

          {/* Success Message */}
          {saveMessage && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <p className="text-sm text-green-800 dark:text-green-200">{saveMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Notification Preferences Link */}
          <div className="pt-4 border-t">
            <Button
              onClick={handleViewNotifications}
              variant="outline"
              className="w-full"
            >
              Manage Notification Preferences
            </Button>
          </div>

          {/* Sign Out */}
          <div className="pt-4 border-t">
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

