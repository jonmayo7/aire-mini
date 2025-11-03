import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabaseClient } from '@/lib/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';

export default function AuthScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (session) {
        // Redirect to dashboard on successful authentication
        navigate('/', { replace: true });
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
          <Auth
            supabaseClient={supabaseClient}
            appearance={{ theme: ThemeSupa }}
            providers={[]}
            onlyThirdPartyProviders={false}
            view="sign_in"
            showLinks={true}
            magicLink={false}
            theme="default"
          />
        </CardContent>
      </Card>
    </div>
  );
}

