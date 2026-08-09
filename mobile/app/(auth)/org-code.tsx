import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
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
import {
  validateOrgCode,
  saveOrganization,
  addOrganization,
} from '../../src/lib/orgContext';

export default function OrgCodeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const headerHeight = useHeaderHeight();

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
          // No session yet (first-time sign-in reached org-code before phone).
          // The org is now saved, so continue to phone verification instead of
          // bouncing back to the welcome screen.
          router.replace('/(auth)/phone');
        }
      }
    } else {
      setError(result.error || 'Invalid organization code');
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <GlassHeader
        title={isAddingNew ? 'Add Organization' : 'Join Organization'}
        onBack={router.canGoBack() ? () => router.back() : undefined}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: headerHeight + spacing.xl },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            {!isAddingNew && (
              <View style={styles.logoContainer}>
                <Logo size={72} color={theme.colors.primary.maroon} />
              </View>
            )}
            <Text style={styles.title}>
              {isAddingNew
                ? 'Add another organization'
                : 'Enter your organization code'}
            </Text>
            <Text style={styles.subtitle}>
              {isAddingNew
                ? 'Enter the code for the new organization you want to join.'
                : 'Your temple, church, or community will provide you with a unique code to join.'}
            </Text>
          </View>

          <GlassSurface
            variant="strong"
            padding="md"
            radius={borderRadius.xl}
            style={styles.card}
          >
            <Input
              label="Organization Code"
              placeholder="TEMPLE-ABC123"
              value={orgCode}
              onChangeText={handleCodeChange}
              autoCapitalize="characters"
              autoCorrect={false}
              autoFocus
              error={error}
              style={styles.codeInput}
            />

            {orgName && (
              <View style={styles.orgFound}>
                <Text style={styles.orgFoundLabel}>Organization found</Text>
                <Text style={styles.orgFoundName}>{orgName}</Text>
              </View>
            )}

            <Text style={styles.helpText}>
              The code looks like: TEMPLE-ABC123
            </Text>
          </GlassSurface>

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
              Don&apos;t have a code? Ask your organization administrator.
            </Text>
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
    header: {
      marginBottom: spacing.xl,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: spacing.lg,
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
    // The code is a fixed token, so it reads better tracked out and centred.
    codeInput: {
      textAlign: 'center',
      fontSize: typography.size.lg,
      letterSpacing: 2,
      fontWeight: typography.weight.semibold,
    },
    helpText: {
      fontSize: typography.size.xs,
      color: theme.colors.text.tertiary,
      marginTop: spacing.sm,
      textAlign: 'center',
    },
    orgFound: {
      marginTop: spacing.md,
      padding: spacing.md,
      backgroundColor: theme.colors.semantic.successLight,
      borderRadius: borderRadius.lg,
      alignItems: 'center',
    },
    orgFoundLabel: {
      fontSize: typography.size.xs,
      color: theme.colors.semantic.success,
      marginBottom: spacing.xs,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    orgFoundName: {
      fontSize: typography.size.lg,
      fontWeight: typography.weight.semibold,
      color: theme.colors.semantic.success,
      textAlign: 'center',
    },
    footer: {
      marginTop: 'auto',
      paddingBottom: spacing.xl,
    },
    footerNote: {
      marginTop: spacing.md,
      fontSize: typography.size.sm,
      color: theme.colors.text.tertiary,
      textAlign: 'center',
    },
  });
