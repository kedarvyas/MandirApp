import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing } from '../src/constants/theme';
import { Button } from '../src/components';
import { supabase } from '../src/lib/supabase';
import { getStoredOrganization, type StoredOrganization } from '../src/lib/orgContext';

export default function WelcomeScreen() {
  const router = useRouter();
  const [storedOrg, setStoredOrg] = useState<StoredOrganization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSessionAndOrg();
  }, []);

  async function checkSessionAndOrg() {
    // Check if user is already logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      // User is logged in, redirect to main app
      router.replace('/(tabs)');
      return;
    }

    // Check for stored organization
    const org = await getStoredOrganization();
    setStoredOrg(org);
    setLoading(false);
  }

  function handleGetStarted() {
    if (storedOrg) {
      // Already have an org, go to phone auth
      router.push('/(auth)/phone');
    } else {
      // Need to enter org code first
      router.push('/(auth)/org-code');
    }
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
        {/* Om Symbol Placeholder */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>ॐ</Text>
        </View>
        <Text style={styles.title}>Sanctum</Text>
        <Text style={styles.subtitle}>Member Check-in</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.welcomeText}>
          Welcome to your community
        </Text>
        <Text style={styles.descriptionText}>
          Sign in with your registered phone number to access your membership and check in.
        </Text>
        {storedOrg && (
          <View style={styles.orgBadge}>
            <Text style={styles.orgBadgeLabel}>Your Organization</Text>
            <Text style={styles.orgBadgeName}>{storedOrg.name}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Button
          title={storedOrg ? 'Sign In' : 'Get Started'}
          onPress={handleGetStarted}
          size="lg"
          fullWidth
        />
        {storedOrg && (
          <Button
            title="Switch Organization"
            onPress={() => router.push('/(auth)/org-code')}
            variant="secondary"
            size="md"
            fullWidth
            style={{ marginTop: spacing.md }}
          />
        )}
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
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logoText: {
    fontSize: 64,
    color: colors.primary.maroon,
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
  orgBadge: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    alignItems: 'center',
  },
  orgBadgeLabel: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  orgBadgeName: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.primary.maroon,
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
