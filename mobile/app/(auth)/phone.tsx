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
import { Feather } from '@expo/vector-icons';
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
  const [smsConsent, setSmsConsent] = useState(false);
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
        {/* Logo. The wordmark matters beyond decoration: this screen otherwise
            shows only the member's own organization name, leaving the sender of
            the text message unidentified for anyone reviewing the opt-in. */}
        <View style={styles.logoContainer}>
          <Logo size={56} color={theme.colors.primary.maroon} />
          <Text style={styles.wordmark}>Sanctum</Text>
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

        {/*
          Twilio toll-free verification requires that consent to receive SMS be
          an explicit, affirmative act, and that it stand on its own rather than
          being bundled with acceptance of the Terms or Privacy Policy. Hence a
          real checkbox, unchecked by default, with the policy links kept in a
          visually separate row below.
        */}
        <TouchableOpacity
          style={styles.consentRow}
          onPress={() => setSmsConsent((c) => !c)}
          activeOpacity={0.7}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: smsConsent }}
          accessibilityLabel="Agree to receive a one-time verification code by text message"
        >
          <View style={[styles.checkbox, smsConsent && styles.checkboxChecked]}>
            {smsConsent && (
              <Feather name="check" size={14} color={theme.colors.text.onImmersive} />
            )}
          </View>
          <Text style={styles.consentText}>
            I agree to receive a one-time verification code by text message from
            Sanctum at the number provided. This is the only text message we
            send — no marketing or promotional messages. Message frequency
            varies by sign-in. Message and data rates may apply. Reply STOP to
            opt out or HELP for help.
          </Text>
        </TouchableOpacity>

        <View style={styles.policyRow}>
          <Text
            style={styles.policyLink}
            onPress={() => Linking.openURL('https://sanctumcommunity.com/privacy')}
          >
            Privacy Policy
          </Text>
          <Text style={styles.policySeparator}> · </Text>
          <Text
            style={styles.policyLink}
            onPress={() => Linking.openURL('https://sanctumcommunity.com/terms')}
          >
            Terms of Service
          </Text>
        </View>

        <View style={styles.footer}>
          <Button
            title="Continue"
            onPress={handleContinue}
            loading={loading}
            disabled={phone.replace(/\D/g, '').length !== 10 || !smsConsent}
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
    wordmark: {
      fontSize: typography.size.lg,
      fontWeight: typography.weight.bold,
      color: theme.colors.primary.maroon,
      letterSpacing: 0.5,
      marginTop: spacing.xs,
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
    consentRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: spacing.md,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: borderRadius.sm,
      borderWidth: 2,
      borderColor: theme.colors.accent.rose,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.sm,
      // Nudge the box onto the first line of text rather than the row's top.
      marginTop: 2,
    },
    checkboxChecked: {
      backgroundColor: theme.colors.primary.maroon,
      borderColor: theme.colors.primary.maroon,
    },
    consentText: {
      flex: 1,
      fontSize: typography.size.xs,
      color: theme.colors.text.secondary,
      lineHeight: typography.size.xs * 1.5,
    },
    // Deliberately a separate row: consent to messaging must not read as
    // bundled with accepting these policies.
    policyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.lg,
      paddingLeft: 22 + spacing.sm,
    },
    policyLink: {
      fontSize: typography.size.xs,
      color: theme.colors.primary.maroon,
      textDecorationLine: 'underline',
    },
    policySeparator: {
      fontSize: typography.size.xs,
      color: theme.colors.text.tertiary,
    },
    footer: {
      marginTop: 'auto',
      paddingBottom: spacing.xl,
    },
  });
