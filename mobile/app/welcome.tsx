import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing } from '../src/constants/theme';
import { Button, Logo } from '../src/components';

/**
 * Signed-out landing screen.
 *
 * This lives at "/welcome" rather than "/" on purpose. "(tabs)" is a route
 * group and contributes no path segment, so app/(tabs)/index.tsx also resolves
 * to "/" -- navigating to "/" from inside the tabs lands on the member home
 * screen instead of here. "/welcome" matches exactly one file.
 */
export default function WelcomeScreen() {
  const router = useRouter();

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
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
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
