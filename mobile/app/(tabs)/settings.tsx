import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useRouter, router as globalRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { colors, typography, spacing } from '../../src/constants/theme';
import { Card } from '../../src/components';
import { supabase } from '../../src/lib/supabase';

import {
  getAllOrganizations,
  getActiveOrgId,
  setActiveOrganization,
  setJustSignedOut,
  StoredOrganization,
} from '../../src/lib/orgContext';

// Legal and support URLs
const PRIVACY_POLICY_URL = 'https://sanctumapp.vercel.app/privacy';
const TERMS_OF_SERVICE_URL = 'https://sanctumapp.vercel.app/terms';
const HELP_URL = 'https://sanctumapp.vercel.app/help';
const CONTACT_EMAIL = 'kedarvyas17@gmail.com';

interface SettingsItemProps {
  title: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
  danger?: boolean;
}

function SettingsItem({
  title,
  subtitle,
  onPress,
  showArrow = true,
  danger = false,
}: SettingsItemProps) {
  return (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingsItemContent}>
        <Text style={[styles.settingsItemTitle, danger && styles.dangerText]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.settingsItemSubtitle}>{subtitle}</Text>
        )}
      </View>
      {showArrow && <Text style={styles.arrow}>›</Text>}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const [_loggingOut, setLoggingOut] = useState(false);
  const [organizations, setOrganizations] = useState<StoredOrganization[]>([]);
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null);
  const [switchingOrg, setSwitchingOrg] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadOrganizations();
    }, [])
  );

  async function loadOrganizations() {
    const orgs = await getAllOrganizations();
    const activeId = await getActiveOrgId();
    setOrganizations(orgs);
    setActiveOrgId(activeId);
  }

  async function handleSwitchOrg(orgId: string) {
    if (orgId === activeOrgId) return;

    setSwitchingOrg(orgId);
    const success = await setActiveOrganization(orgId);
    if (success) {
      setActiveOrgId(orgId);
      // Navigate to home to reload with new org context
      router.replace('/(tabs)');
    } else {
      Alert.alert('Error', 'Failed to switch organization');
    }
    setSwitchingOrg(null);
  }

  async function handleSignOut() {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? Your organization will be remembered for easy sign-in.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            try {
              // Set flag BEFORE signing out to prevent race condition
              await setJustSignedOut();

              // Sign out with local scope to ensure session is cleared from device
              const { error } = await supabase.auth.signOut({ scope: 'local' });

              if (error) {
                throw error;
              }

              // Small delay to ensure session is cleared before navigation
              await new Promise(resolve => setTimeout(resolve, 200));

              // Navigate to welcome screen using dismissTo to reset stack
              if (globalRouter.canDismiss()) {
                globalRouter.dismissAll();
              }
              globalRouter.replace('/');
            } catch (err) {
              console.error('Sign out error:', err);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
              setLoggingOut(false);
            }
          },
        },
      ]
    );
  }

  function handleAddOrganization() {
    router.push('/(auth)/org-code?addNew=true');
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Account Section */}
      <Text style={styles.sectionTitle}>Account</Text>
      <Card style={styles.sectionCard} padding="none">
        <SettingsItem
          title="Edit Profile"
          subtitle="Update your name, photo, and email"
          onPress={() => router.push('/edit-profile')}
        />
        <View style={styles.divider} />
        <SettingsItem
          title="Change Phone Number"
          subtitle="Update your phone number"
          onPress={() => {
            // TODO: Implement change phone flow
            Alert.alert('Coming Soon', 'Phone number change will be available in a future update.');
          }}
        />
      </Card>

      {/* My Organizations Section */}
      <Text style={styles.sectionTitle}>My Organizations</Text>
      <Card style={styles.sectionCard} padding="none">
        {organizations.map((org, index) => (
          <View key={org.id}>
            {index > 0 && <View style={styles.divider} />}
            <TouchableOpacity
              style={styles.orgItem}
              onPress={() => handleSwitchOrg(org.id)}
              activeOpacity={0.7}
              disabled={switchingOrg !== null}
            >
              <View style={styles.orgInfo}>
                <Text style={styles.orgName}>{org.name}</Text>
                <Text style={styles.orgCode}>{org.org_code}</Text>
              </View>
              {switchingOrg === org.id ? (
                <ActivityIndicator size="small" color={colors.primary.maroon} />
              ) : activeOrgId === org.id ? (
                <View style={styles.activeIndicator}>
                  <Feather name="check" size={14} color={colors.utility.white} />
                </View>
              ) : null}
            </TouchableOpacity>
          </View>
        ))}
        {organizations.length > 0 && <View style={styles.divider} />}
        <SettingsItem
          title="Add Organization"
          subtitle="Join another organization"
          onPress={handleAddOrganization}
        />
      </Card>

      {/* Preferences Section */}
      <Text style={styles.sectionTitle}>Preferences</Text>
      <Card style={styles.sectionCard} padding="none">
        <SettingsItem
          title="Notifications"
          subtitle="Manage push notifications"
          onPress={() => router.push('/notification-settings')}
        />
      </Card>

      {/* Support Section */}
      <Text style={styles.sectionTitle}>Support</Text>
      <Card style={styles.sectionCard} padding="none">
        <SettingsItem
          title="Help & FAQ"
          onPress={() => WebBrowser.openBrowserAsync(HELP_URL)}
        />
        <View style={styles.divider} />
        <SettingsItem
          title="Contact Us"
          subtitle={CONTACT_EMAIL}
          onPress={async () => {
            try {
              await Linking.openURL(`mailto:${CONTACT_EMAIL}`);
            } catch {
              Alert.alert('Contact Us', `Email us at:\n${CONTACT_EMAIL}`);
            }
          }}
        />
        <View style={styles.divider} />
        <SettingsItem
          title="Privacy Policy"
          onPress={() => WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL)}
        />
        <View style={styles.divider} />
        <SettingsItem
          title="Terms of Service"
          onPress={() => WebBrowser.openBrowserAsync(TERMS_OF_SERVICE_URL)}
        />
      </Card>

      {/* Sign Out */}
      <Card style={styles.sectionCard} padding="none">
        <SettingsItem
          title="Sign Out"
          onPress={handleSignOut}
          showArrow={false}
          danger
        />
      </Card>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Sanctum v1.0.0</Text>
        <Text style={styles.versionSubtext}>Made with ❤️</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  // Section
  sectionTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
    marginLeft: spacing.xs,
  },
  sectionCard: {
    overflow: 'hidden',
  },

  // Settings Item
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  settingsItemContent: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    color: colors.text.primary,
  },
  settingsItemSubtitle: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  arrow: {
    fontSize: typography.size.xl,
    color: colors.text.tertiary,
    marginLeft: spacing.sm,
  },
  dangerText: {
    color: colors.semantic.error,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.utility.divider,
    marginLeft: spacing.md,
  },

  // Organization Item
  orgItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  orgInfo: {
    flex: 1,
  },
  orgName: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    color: colors.text.primary,
  },
  orgCode: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  activeIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.semantic.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: colors.utility.white,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
  },

  // Version
  versionContainer: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  versionText: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
  },
  versionSubtext: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
});
