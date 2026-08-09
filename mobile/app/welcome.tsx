import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  borderRadius,
  spacing,
  Theme,
  typography,
} from '../src/constants/theme';
import { Button, GlassSurface, GradientBackdrop, Logo } from '../src/components';
import { useTheme, useThemedStyles } from '../src/lib/themeContext';

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
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <GradientBackdrop />

      <View
        style={[
          styles.body,
          {
            paddingTop: insets.top + spacing.xl,
            paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.lg,
          },
        ]}
      >
        <View style={styles.heroSection}>
          {/* The mark sits on its own glass disc so it reads as an object on
              the backdrop rather than a sticker floating on it. */}
          <GlassSurface
            padding="none"
            radius={borderRadius.full}
            elevation="lg"
            style={styles.logoDisc}
            contentStyle={styles.logoDiscContent}
          >
            <Logo size={104} color={theme.colors.primary.maroon} />
          </GlassSurface>

          <Text style={styles.title}>Sanctum</Text>
          <Text style={styles.tagline}>Member Check-in</Text>
        </View>

        <GlassSurface
          variant="strong"
          padding="lg"
          radius={borderRadius.xxl}
          elevation="pass"
          contentStyle={styles.footerCard}
        >
          <Text style={styles.welcomeText}>Welcome to your community</Text>
          <Button
            title="Sign In with Phone"
            onPress={() => router.push('/(auth)/phone')}
            size="lg"
            fullWidth
          />
          <Text style={styles.footerNote}>
            New members: please visit the front desk to register
          </Text>
        </GlassSurface>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    body: {
      flex: 1,
      paddingHorizontal: spacing.lg,
    },
    heroSection: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: spacing.xl,
    },
    logoDisc: {
      marginBottom: spacing.xl,
    },
    logoDiscContent: {
      width: 168,
      height: 168,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 44,
      fontWeight: typography.weight.bold,
      color: theme.colors.primary.maroon,
      letterSpacing: 1.5,
      marginBottom: spacing.xs,
    },
    tagline: {
      fontSize: typography.size.md,
      color: theme.colors.text.tertiary,
      letterSpacing: 1.2,
    },
    footerCard: {
      alignItems: 'center',
    },
    welcomeText: {
      fontSize: typography.size.lg,
      fontWeight: typography.weight.medium,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginBottom: spacing.lg,
    },
    footerNote: {
      marginTop: spacing.md,
      fontSize: typography.size.sm,
      color: theme.colors.text.tertiary,
      textAlign: 'center',
    },
  });
