import { useAuth } from './authContext';

/**
 * Hook that provides authenticated fetch function
 * Automatically includes JWT token from current session
 */
export function useAuthenticatedFetch() {
  const { session } = useAuth();

  const authenticatedFetch = async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    if (!session?.access_token) {
      throw new Error('No active session. Please log in.');
    }

    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${session.access_token}`);
    headers.set('Content-Type', 'application/json');

    return fetch(url, {
      ...options,
      headers,
    });
  };

  return { authenticatedFetch, hasSession: !!session?.access_token };
}

