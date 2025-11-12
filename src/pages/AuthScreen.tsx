import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabaseClient } from '@/lib/supabaseClient';
import { useTheme } from '@/lib/themeContext';
import { Card, CardContent } from '@/components/ui/card';

export default function AuthScreen() {
  const navigate = useNavigate();
  const { effectiveTheme } = useTheme();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/', { replace: true });
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event, session) => {
      // Handle different auth events
      switch (event) {
        case 'SIGNED_IN':
          if (session) {
            navigate('/', { replace: true });
          }
          break;
        case 'SIGNED_OUT':
          setError(null);
          break;
        case 'TOKEN_REFRESHED':
        case 'USER_UPDATED':
        case 'PASSWORD_RECOVERY':
          // Silent handling for these events
          break;
        default:
          if (session) {
            navigate('/', { replace: true });
          }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          <Auth
            supabaseClient={supabaseClient}
            appearance={{ 
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--primary))',
                    brandAccent: 'hsl(var(--primary))',
                    inputText: 'hsl(var(--foreground))',
                    inputLabelText: 'hsl(var(--foreground))',
                    inputPlaceholder: 'hsl(var(--muted-foreground))',
                    inputBackground: 'hsl(var(--input))',
                    inputBorder: 'hsl(var(--border))',
                    inputBorderHover: 'hsl(var(--ring))',
                    inputBorderFocus: 'hsl(var(--ring))',
                    messageText: 'hsl(var(--foreground))',
                    messageTextDanger: 'hsl(var(--destructive))',
                    anchorText: 'hsl(var(--primary))',
                    anchorTextHover: 'hsl(var(--primary))',
                    buttonBackground: 'hsl(var(--primary))',
                    buttonBackgroundHover: 'hsl(var(--primary))',
                    buttonText: 'hsl(var(--primary-foreground))',
                  },
                  space: {
                    inputPadding: '0.5rem',
                    labelBottomMargin: '0.5rem',
                    anchorBottomMargin: '0.5rem',
                    messageBottomMargin: '0.5rem',
                  },
                  fontSizes: {
                    baseBodySize: '0.875rem',
                    baseInputSize: '0.875rem',
                    baseLabelSize: '0.875rem',
                    baseButtonSize: '0.875rem',
                  },
                },
              },
            }}
            providers={[]}
            onlyThirdPartyProviders={false}
            view="sign_in"
            showLinks={true}
            magicLink={false}
            theme={effectiveTheme === 'dark' ? 'dark' : 'default'}
            redirectTo={`${window.location.origin}/#/`}
          />
        </CardContent>
      </Card>
    </div>
  );
}

