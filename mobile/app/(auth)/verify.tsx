import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
import { Button } from '../../src/components';
import { supabase } from '../../src/lib/supabase';
import { getStoredOrganization } from '../../src/lib/orgContext';

const CODE_LENGTH = 6;

export default function VerifyScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(60);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  function handleCodeChange(index: number, value: string) {
    setError('');

    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1);

    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    // Auto-advance to next input
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (digit && index === CODE_LENGTH - 1) {
      const fullCode = newCode.join('');
      if (fullCode.length === CODE_LENGTH) {
        handleVerify(fullCode);
      }
    }
  }

  function handleKeyPress(index: number, key: string) {
    // Handle backspace
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleVerify(verificationCode?: string) {
    const codeToVerify = verificationCode || code.join('');

    if (codeToVerify.length !== CODE_LENGTH) {
      setError('Please enter the complete verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        phone: phone!,
        token: codeToVerify,
        type: 'sms',
      });

      if (verifyError) {
        setError('Invalid code. Please try again.');
        setCode(Array(CODE_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
        return;
      }

      if (data.session) {
        // Get the current organization
        const storedOrg = await getStoredOrganization();

        // Check if user has completed profile for this organization
        const { data: member } = await supabase
          .from('members')
          .select('status, photo_url')
          .eq('phone', phone)
          .eq('organization_id', storedOrg?.id || '')
          .single();

        if (!member || member?.status === 'pending_registration' || !member?.photo_url) {
          // Profile incomplete or doesn't exist for this org, go to setup
          router.replace('/(auth)/profile-setup');
        } else {
          // Profile complete, go to main app
          router.replace('/(tabs)');
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('Verify error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendCountdown > 0) return;

    setLoading(true);
    setError('');

    try {
      const { error: resendError } = await supabase.auth.signInWithOtp({
        phone: phone!,
      });

      if (resendError) {
        setError(resendError.message);
        return;
      }

      setResendCountdown(60);
      setCode(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Format phone for display
  function formatPhoneDisplay(phoneNumber: string): string {
    const digits = phoneNumber.replace(/\D/g, '').slice(-10);
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
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
        <View style={styles.header}>
          <Text style={styles.title}>Verify your phone</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to{'\n'}
            <Text style={styles.phoneText}>{formatPhoneDisplay(phone || '')}</Text>
          </Text>
        </View>

        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.codeInput,
                digit && styles.codeInputFilled,
                error && styles.codeInputError,
              ]}
              value={digit}
              onChangeText={(value) => handleCodeChange(index, value)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive a code? </Text>
          <TouchableOpacity
            onPress={handleResend}
            disabled={resendCountdown > 0 || loading}
          >
            <Text
              style={[
                styles.resendLink,
                resendCountdown > 0 && styles.resendLinkDisabled,
              ]}
            >
              {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Button
            title="Verify"
            onPress={() => handleVerify()}
            loading={loading}
            disabled={code.join('').length !== CODE_LENGTH}
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
    paddingTop: spacing.xl,
  },
  header: {
    marginBottom: spacing.xxl,
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
  phoneText: {
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  codeInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: colors.accent.rose,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.utility.white,
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  codeInputFilled: {
    borderColor: colors.primary.maroon,
    backgroundColor: colors.background.secondary,
  },
  codeInputError: {
    borderColor: colors.semantic.error,
  },
  error: {
    fontSize: typography.size.sm,
    color: colors.semantic.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  resendText: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
  },
  resendLink: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.primary.maroon,
  },
  resendLinkDisabled: {
    color: colors.text.tertiary,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: spacing.xl,
  },
});
