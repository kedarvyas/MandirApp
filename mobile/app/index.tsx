import { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing } from '../src/constants/theme';
import { Button } from '../src/components';
import { supabase } from '../src/lib/supabase';

export default function WelcomeScreen() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    checkSession();
  }, []);

  async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      // User is logged in, redirect to main app
      router.replace('/(tabs)');
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Om Symbol Placeholder */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>ॐ</Text>
        </View>
        <Text style={styles.title}>Mandir</Text>
        <Text style={styles.subtitle}>Member Check-in</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.welcomeText}>
          Welcome to your community
        </Text>
        <Text style={styles.descriptionText}>
          Sign in with your registered phone number to access your membership and check-in at the mandir.
        </Text>
      </View>

      <View style={styles.footer}>
        <Button
          title="Get Started"
          onPress={() => router.push('/(auth)/phone')}
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
