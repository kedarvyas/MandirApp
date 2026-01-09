import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { supabase } from './supabase';

// Required for expo-auth-session
WebBrowser.maybeCompleteAuthSession();

// Your Supabase project URL
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;

/**
 * Initiates Google Sign-In flow using Supabase OAuth
 */
export async function signInWithGoogle(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Create redirect URL that points back to our app
    const redirectUrl = AuthSession.makeRedirectUri({
      scheme: 'sanctum',
      path: 'auth/callback',
    });

    console.log('Redirect URL:', redirectUrl);

    // Get the OAuth URL from Supabase
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      console.error('OAuth error:', error);
      return { success: false, error: error.message };
    }

    if (!data.url) {
      return { success: false, error: 'Failed to get authorization URL' };
    }

    // Open the browser for authentication
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectUrl,
      {
        showInRecents: true,
      }
    );

    console.log('Auth result:', result);

    if (result.type === 'success' && result.url) {
      // Extract the tokens from the URL
      const url = new URL(result.url);

      // Handle hash fragment (Supabase returns tokens in hash)
      const hashParams = new URLSearchParams(url.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      if (accessToken && refreshToken) {
        // Set the session manually
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          console.error('Session error:', sessionError);
          return { success: false, error: sessionError.message };
        }

        return { success: true };
      }

      // Handle query params (in case Supabase returns code)
      const code = url.searchParams.get('code');
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          console.error('Exchange error:', exchangeError);
          return { success: false, error: exchangeError.message };
        }
        return { success: true };
      }

      return { success: false, error: 'No authentication tokens received' };
    }

    if (result.type === 'cancel') {
      return { success: false, error: 'Sign in was cancelled' };
    }

    return { success: false, error: 'Authentication failed' };
  } catch (err) {
    console.error('Google sign in error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error occurred'
    };
  }
}
