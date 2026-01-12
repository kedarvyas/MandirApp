import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing } from '../src/constants/theme';
import { Button, Logo } from '../src/components';
import { supabase } from '../src/lib/supabase';
import { getStoredOrganization, checkAndClearSignedOut } from '../src/lib/orgContext';

export default function WelcomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSignOutAndSession();
  }, []);

  async function checkSignOutAndSession() {
    console.log('[Welcome] Checking sign out status...');
    // Check if user just signed out - if so, skip session check
    const justSignedOut = await checkAndClearSignedOut();
    console.log('[Welcome] justSignedOut flag:', justSignedOut);
    if (justSignedOut) {
      console.log('[Welcome] User just signed out, showing welcome screen');
      setLoading(false);
      return;
    }
    console.log('[Welcome] Checking session...');
    checkSession();
  }

  async function checkSession() {
    // Check if user is already logged in
    const { data: { session } } = await supabase.auth.getSession();
    console.log('[Welcome] Session exists:', !!session);
    if (session) {
      // User is logged in, check if they need to select org or go to app
      const org = await getStoredOrganization();
      console.log('[Welcome] Stored org:', org?.name || 'none');
      if (org) {
        console.log('[Welcome] Redirecting to tabs...');
        router.replace('/(tabs)');
      } else {
        // Has session but no org - need to select organization
        console.log('[Welcome] Redirecting to org-code...');
        router.replace('/(auth)/org-code');
      }
      return;
    }

    console.log('[Welcome] No session, showing welcome screen');
    setLoading(false);
  }

  function handlePhoneSignIn() {
    // Go to phone auth - org will be requested after authentication
    router.push('/(auth)/phone');
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.heroSection}>
        <View style={styles.logoContainer}>
          <Logo size={120} />
        </View>
        <Text style={styles.title}>Sanctum</Text>
        <Text style={styles.tagline}>Member Check-in</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.welcomeText}>
          Welcome to your community
        </Text>
        <Button
          title="Sign In with Phone"
          onPress={handlePhoneSignIn}
          size="lg"
          fullWidth
        />
        <Text style={styles.footerNote}>
          New members: Please visit the front desk to register
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: spacing.xxl,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 48,
    fontWeight: typography.weight.bold,
    color: colors.primary.maroon,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  tagline: {
    fontSize: typography.size.md,
    color: colors.text.tertiary,
    letterSpacing: 1,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: spacing.lg,
  },
  welcomeText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.medium,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  footerNote: {
    marginTop: spacing.md,
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});
