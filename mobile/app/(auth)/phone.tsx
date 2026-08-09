import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  borderRadius,
  spacing,
  Theme,
  typography,
} from '../../src/constants/theme';
import {
  Button,
  Input,
  GlassHeader,
  GlassSurface,
  Logo,
  useHeaderHeight,
} from '../../src/components';
import { useTheme, useThemedStyles } from '../../src/lib/themeContext';
import { supabase } from '../../src/lib/supabase';
import { getStoredOrganization, type StoredOrganization } from '../../src/lib/orgContext';
import { formatPhoneInput, toE164 } from '../../src/lib/phone';

export default function PhoneScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const headerHeight = useHeaderHeight();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [organization, setOrganization] = useState<StoredOrganization | null>(null);

  useEffect(() => {
    loadOrganization();
  }, []);

  async function loadOrganization() {
    const org = await getStoredOrganization();
    if (!org) {
      // No org stored, go back to org code screen
      router.replace('/(auth)/org-code');
      return;
    }
    setOrganization(org);
  }

  function handlePhoneChange(value: string) {
    setError('');
    setPhone(formatPhoneInput(value));
  }

  // Get raw phone number for API
  function getRawPhone(): string {
    return toE164(phone);
  }

  async function handleContinue() {
    const rawPhone = getRawPhone();

    // Validate phone number
    if (rawPhone.length !== 12) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Send OTP via Supabase
      const { error: authError } = await supabase.auth.signInWithOtp({
        phone: rawPhone,
      });

      if (authError) {
        // Check if user is not registered
        if (authError.message.includes('not found') || authError.message.includes('not registered')) {
          setError('This phone number is not registered. Please visit the front desk to become a member.');
        } else {
          setError(authError.message);
        }
        return;
      }

      // Navigate to verification screen
      router.push({
        pathname: '/(auth)/verify',
        params: { phone: rawPhone },
      });
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('Phone auth error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <GlassHeader
        title="Sign In"
        onBack={router.canGoBack() ? () => router.back() : undefined}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: headerHeight + spacing.lg },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Logo size={56} color={theme.colors.primary.maroon} />
        </View>

        {/* Organization Badge */}
        {organization && (
          <TouchableOpacity
            onPress={() => router.push('/(auth)/org-code')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`Signing in to ${organization.name}. Tap to change.`}
            style={styles.orgBadgeWrapper}
          >
            <GlassSurface
              padding="md"
              radius={borderRadius.xl}
              contentStyle={styles.orgBadge}
            >
              <Text style={styles.orgBadgeLabel}>Signing in to</Text>
              <Text style={styles.orgBadgeName}>{organization.name}</Text>
              <Text style={styles.orgBadgeChange}>Tap to change</Text>
            </GlassSurface>
          </TouchableOpacity>
        )}

        <View style={styles.header}>
          <Text style={styles.title}>Enter your phone number</Text>
          <Text style={styles.subtitle}>
            We&apos;ll send you a verification code to confirm your membership.
          </Text>
        </View>

        <GlassSurface
          variant="strong"
          padding="md"
          radius={borderRadius.xl}
          style={styles.card}
        >
          <Input
            label="Phone Number"
            placeholder="(555) 123-4567"
            value={phone}
            onChangeText={handlePhoneChange}
            keyboardType="phone-pad"
            autoFocus
            error={error}
          />

          <Text style={styles.countryNote}>
            Currently only US phone numbers (+1) are supported.
          </Text>
        </GlassSurface>

        <Text style={styles.smsConsent}>
          By tapping Continue, you agree to receive a one-time verification code
          by text message. Message frequency varies based on how often you sign
          in. Message and data rates may apply. Reply STOP to opt out or HELP for
          help. See our{' '}
          <Text
            style={styles.smsConsentLink}
            onPress={() => Linking.openURL('https://sanctumcommunity.com/privacy')}
          >
            Privacy Policy
          </Text>{' '}
          and{' '}
          <Text
            style={styles.smsConsentLink}
            onPress={() => Linking.openURL('https://sanctumcommunity.com/terms')}
          >
            Terms of Service
          </Text>
          .
        </Text>

        <View style={styles.footer}>
          <Button
            title="Continue"
            onPress={handleContinue}
            loading={loading}
            disabled={phone.replace(/\D/g, '').length !== 10}
            size="lg"
            fullWidth
          />
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: spacing.lg,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    orgBadgeWrapper: {
      marginBottom: spacing.lg,
    },
    orgBadge: {
      alignItems: 'center',
    },
    orgBadgeLabel: {
      fontSize: typography.size.xs,
      color: theme.colors.text.tertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    orgBadgeName: {
      fontSize: typography.size.lg,
      fontWeight: typography.weight.semibold,
      color: theme.colors.primary.maroon,
      marginVertical: spacing.xs,
      textAlign: 'center',
    },
    orgBadgeChange: {
      fontSize: typography.size.xs,
      color: theme.colors.text.tertiary,
    },
    header: {
      marginBottom: spacing.xl,
    },
    title: {
      fontSize: typography.size.xxl,
      fontWeight: typography.weight.bold,
      color: theme.colors.text.primary,
      marginBottom: spacing.sm,
      letterSpacing: -0.3,
    },
    subtitle: {
      fontSize: typography.size.md,
      color: theme.colors.text.secondary,
      lineHeight: typography.size.md * 1.5,
    },
    card: {
      marginBottom: spacing.lg,
    },
    countryNote: {
      fontSize: typography.size.xs,
      color: theme.colors.text.tertiary,
      marginTop: spacing.xs,
    },
    smsConsent: {
      fontSize: typography.size.xs,
      color: theme.colors.text.tertiary,
      lineHeight: typography.size.xs * 1.5,
      marginBottom: spacing.lg,
    },
    smsConsentLink: {
      color: theme.colors.primary.maroon,
      textDecorationLine: 'underline',
    },
    footer: {
      marginTop: 'auto',
      paddingBottom: spacing.xl,
    },
  });
