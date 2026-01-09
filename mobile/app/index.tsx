import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing } from '../src/constants/theme';
import { Button, Logo } from '../src/components';
import { supabase } from '../src/lib/supabase';
import { getStoredOrganization } from '../src/lib/orgContext';

export default function WelcomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    // Check if user is already logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      // User is logged in, check if they need to select org or go to app
      const org = await getStoredOrganization();
      if (org) {
        router.replace('/(tabs)');
      } else {
        // Has session but no org - need to select organization
        router.replace('/(auth)/org-code');
      }
      return;
    }

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
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Logo size={100} />
        </View>
        <Text style={styles.title}>Sanctum</Text>
        <Text style={styles.subtitle}>Member Check-in</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.welcomeText}>
          Welcome to your community
        </Text>
        <Text style={styles.descriptionText}>
          Sign in to access your membership and check in to events.
        </Text>
      </View>

      <View style={styles.footer}>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxxl,
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
  header: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.size.display,
    fontWeight: typography.weight.bold,
    color: colors.primary.maroon,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.size.lg,
    color: colors.text.secondary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  welcomeText: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  descriptionText: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.size.md * 1.6,
  },
  footer: {
    alignItems: 'center',
  },
  footerNote: {
    marginTop: spacing.md,
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});
