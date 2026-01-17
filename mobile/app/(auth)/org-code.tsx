import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, typography, spacing } from '../../src/constants/theme';
import { Button, Input, Card, Logo } from '../../src/components';
import { supabase } from '../../src/lib/supabase';
import {
  validateOrgCode,
  saveOrganization,
  addOrganization,
} from '../../src/lib/orgContext';

export default function OrgCodeScreen() {
  const router = useRouter();
  const { addNew } = useLocalSearchParams<{ addNew?: string }>();
  const isAddingNew = addNew === 'true';

  const [orgCode, setOrgCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orgName, setOrgName] = useState<string | null>(null);

  // Format org code as user types (uppercase, add dash if needed)
  function formatOrgCode(value: string): string {
    // Remove spaces, convert to uppercase
    const formatted = value.toUpperCase().replace(/\s/g, '');

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
      setOrgName(result.organization.name);

      if (isAddingNew) {
        // Adding to existing user's organizations
        await addOrganization(result.organization);
        // Short delay to show success, then go to home
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 500);
      } else {
        // User just authenticated - save org and check if they need profile setup
        await saveOrganization(result.organization);

        // Get current user to check their profile
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Check if user has completed profile for this organization
          const { data: member } = await supabase
            .from('members')
            .select('status, photo_url')
            .eq('organization_id', result.organization.id)
            .or(`phone.eq.${user.phone},email.eq.${user.email}`)
            .single();

          setTimeout(() => {
            if (!member || member?.status === 'pending_registration' || !member?.photo_url) {
              router.replace('/(auth)/profile-setup');
            } else {
              router.replace('/(tabs)');
            }
          }, 500);
        } else {
          // No user session (shouldn't happen in new flow)
          router.replace('/');
        }
      }
    } else {
      setError(result.error || 'Invalid organization code');
      setLoading(false);
    }
  }

  function handleCancel() {
    router.back();
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
          {isAddingNew && (
            <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          )}
          {!isAddingNew && (
            <View style={styles.logoContainer}>
              <Logo size={80} />
              <Text style={styles.brandName}>Sanctum</Text>
            </View>
          )}
          <Text style={styles.title}>
            {isAddingNew ? 'Add another organization' : 'Enter your organization code'}
          </Text>
          <Text style={styles.subtitle}>
            {isAddingNew
              ? 'Enter the code for the new organization you want to join.'
              : 'Your temple, church, or community will provide you with a unique code to join.'}
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  brandName: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginTop: spacing.sm,
    letterSpacing: 1,
  },
  cancelButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  cancelText: {
    fontSize: typography.size.md,
    color: colors.primary.maroon,
    fontWeight: typography.weight.medium,
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
