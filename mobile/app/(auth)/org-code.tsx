import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing } from '../../src/constants/theme';
import { Button, Input, Card } from '../../src/components';
import {
  validateOrgCode,
  saveOrganization,
  getStoredOrganization,
  type StoredOrganization,
} from '../../src/lib/orgContext';

export default function OrgCodeScreen() {
  const router = useRouter();
  const [orgCode, setOrgCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingStored, setCheckingStored] = useState(true);
  const [error, setError] = useState('');
  const [orgName, setOrgName] = useState<string | null>(null);

  useEffect(() => {
    // Check if user already has a stored organization
    checkStoredOrg();
  }, []);

  async function checkStoredOrg() {
    const storedOrg = await getStoredOrganization();
    if (storedOrg) {
      // User already has an org, go straight to phone auth
      router.replace('/(auth)/phone');
    } else {
      setCheckingStored(false);
    }
  }

  // Format org code as user types (uppercase, add dash if needed)
  function formatOrgCode(value: string): string {
    // Remove spaces, convert to uppercase
    let formatted = value.toUpperCase().replace(/\s/g, '');

    // If user hasn't typed the dash and we have enough chars, don't auto-add
    // Let them type naturally
    return formatted.slice(0, 15); // Max length
  }

  function handleCodeChange(value: string) {
    setError('');
    setOrgName(null);
    setOrgCode(formatOrgCode(value));
  }

  async function handleContinue() {
    if (orgCode.length < 5) {
      setError('Please enter a valid organization code');
      return;
    }

    setLoading(true);
    setError('');

    const result = await validateOrgCode(orgCode);

    if (result.success && result.organization) {
      // Save the organization and proceed
      await saveOrganization(result.organization);
      setOrgName(result.organization.name);

      // Short delay to show the org name before navigating
      setTimeout(() => {
        router.push('/(auth)/phone');
      }, 500);
    } else {
      setError(result.error || 'Invalid organization code');
      setLoading(false);
    }
  }

  if (checkingStored) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
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
          <Text style={styles.title}>Enter your organization code</Text>
          <Text style={styles.subtitle}>
            Your temple, church, or community will provide you with a unique code to join.
          </Text>
        </View>

        <Card style={styles.card}>
          <Input
            label="Organization Code"
            placeholder="TEMPLE-ABC123"
            value={orgCode}
            onChangeText={handleCodeChange}
            autoCapitalize="characters"
            autoCorrect={false}
            autoFocus
            error={error}
          />

          {orgName && (
            <View style={styles.orgFound}>
              <Text style={styles.orgFoundLabel}>Organization Found:</Text>
              <Text style={styles.orgFoundName}>{orgName}</Text>
            </View>
          )}

          <Text style={styles.helpText}>
            The code looks like: TEMPLE-ABC123
          </Text>
        </Card>

        <View style={styles.footer}>
          <Button
            title={loading ? 'Verifying...' : 'Continue'}
            onPress={handleContinue}
            loading={loading}
            disabled={orgCode.length < 5}
            size="lg"
            fullWidth
          />

          <Text style={styles.footerNote}>
            Don't have a code? Ask your organization administrator.
          </Text>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
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
  helpText: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
  },
  orgFound: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.semantic.successLight,
    borderRadius: 8,
  },
  orgFoundLabel: {
    fontSize: typography.size.xs,
    color: colors.semantic.success,
    marginBottom: spacing.xs,
  },
  orgFoundName: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.semantic.success,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: spacing.xl,
  },
  footerNote: {
    marginTop: spacing.md,
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});
