import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
import { Button, Input, Card, Logo } from '../../src/components';
import { supabase } from '../../src/lib/supabase';
import { getStoredOrganization, type StoredOrganization } from '../../src/lib/orgContext';

export default function PhoneScreen() {
  const router = useRouter();
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

  // Format phone number as user types
  function formatPhoneNumber(value: string): string {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');

    // Limit to 10 digits
    const limited = digits.slice(0, 10);

    // Format as (XXX) XXX-XXXX
    if (limited.length <= 3) {
      return limited;
    } else if (limited.length <= 6) {
      return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
    } else {
      return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`;
    }
  }

  function handlePhoneChange(value: string) {
    setError('');
    setPhone(formatPhoneNumber(value));
  }

  // Get raw phone number for API
  function getRawPhone(): string {
    return '+1' + phone.replace(/\D/g, '');
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Logo size={60} />
        </View>

        {/* Organization Badge */}
        {organization && (
          <TouchableOpacity
            style={styles.orgBadge}
            onPress={() => router.push('/(auth)/org-code')}
            activeOpacity={0.7}
          >
            <Text style={styles.orgBadgeLabel}>Signing in to</Text>
            <Text style={styles.orgBadgeName}>{organization.name}</Text>
            <Text style={styles.orgBadgeChange}>Tap to change</Text>
          </TouchableOpacity>
        )}

        <View style={styles.header}>
          <Text style={styles.title}>Enter your phone number</Text>
          <Text style={styles.subtitle}>
            We'll send you a verification code to confirm your membership.
          </Text>
        </View>

        <Card style={styles.card}>
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
        </Card>

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  orgBadge: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  orgBadgeLabel: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
  },
  orgBadgeName: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.primary.maroon,
    marginVertical: spacing.xs,
  },
  orgBadgeChange: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
    textDecorationLine: 'underline',
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
    lineHeight: typography.size.md * 1.5,
  },
  card: {
    marginBottom: spacing.lg,
  },
  countryNote: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: spacing.xl,
  },
});
