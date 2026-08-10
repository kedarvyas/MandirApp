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
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import {
  borderRadius,
  spacing,
  Theme,
  typography,
} from '../../src/constants/theme';
import {
  GlassHeader,
  GlassSurface,
  useHeaderHeight,
  useTabBarInset,
} from '../../src/components';
import {
  ThemePreference,
  useTheme,
  useThemeContext,
  useThemedStyles,
} from '../../src/lib/themeContext';
import { supabase } from '../../src/lib/supabase';

import {
  getAllOrganizations,
  getActiveOrgId,
  setActiveOrganization,
  StoredOrganization,
} from '../../src/lib/orgContext';

// Legal and support URLs
const PRIVACY_POLICY_URL = 'https://sanctumcommunity.com/privacy';
const TERMS_OF_SERVICE_URL = 'https://sanctumcommunity.com/terms';
const HELP_URL = 'https://sanctumcommunity.com/help';
const CONTACT_EMAIL = 'kedarvyas17@gmail.com';

const APPEARANCE_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

type Styles = ReturnType<typeof createStyles>;

interface SettingsItemProps {
  styles: Styles;
  theme: Theme;
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
  danger?: boolean;
}

function SettingsItem({
  styles,
  theme,
  icon,
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
      accessibilityRole="button"
    >
      <View style={[styles.itemIcon, danger && styles.itemIconDanger]}>
        <Feather
          name={icon}
          size={16}
          color={
            danger ? theme.colors.semantic.error : theme.colors.primary.maroon
          }
        />
      </View>
      <View style={styles.settingsItemContent}>
        <Text style={[styles.settingsItemTitle, danger && styles.dangerText]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.settingsItemSubtitle}>{subtitle}</Text>
        )}
      </View>
      {showArrow && (
        <Feather
          name="chevron-right"
          size={18}
          color={theme.colors.text.tertiary}
        />
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const headerHeight = useHeaderHeight();
  const tabBarInset = useTabBarInset();
  const { preference, setPreference } = useThemeContext();

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
              // Clear the session from the device. The root layout watches the
              // session and moves to the welcome screen once it clears, so this
              // screen must not navigate as well.
              const { error } = await supabase.auth.signOut({ scope: 'local' });

              if (error) {
                throw error;
              }
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
    <View style={styles.container}>
      <GlassHeader title="Settings" />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: headerHeight + spacing.md, paddingBottom: tabBarInset },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Section */}
        <Text style={styles.sectionTitle}>Account</Text>
        <GlassSurface variant="strong" padding="none" radius={borderRadius.xl}>
          <SettingsItem
            styles={styles}
            theme={theme}
            icon="user"
            title="Edit Profile"
            subtitle="Update your name, photo, and email"
            onPress={() => router.push('/edit-profile')}
          />
        </GlassSurface>

        {/* Appearance Section */}
        <Text style={styles.sectionTitle}>Appearance</Text>
        <GlassSurface
          variant="strong"
          padding="md"
          radius={borderRadius.xl}
          contentStyle={styles.appearanceCard}
        >
          <Text style={styles.appearanceHint}>
            Sanctum follows your device by default.
          </Text>
          <View style={styles.segmented}>
            {APPEARANCE_OPTIONS.map((option) => {
              const isSelected = preference === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.segment,
                    isSelected && styles.segmentSelected,
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setPreference(option.value);
                  }}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      isSelected && styles.segmentTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </GlassSurface>

        {/* My Organizations Section */}
        <Text style={styles.sectionTitle}>My Organizations</Text>
        <GlassSurface variant="strong" padding="none" radius={borderRadius.xl}>
          {organizations.map((org, index) => (
            <View key={org.id}>
              {index > 0 && <View style={styles.divider} />}
              <TouchableOpacity
                style={styles.orgItem}
                onPress={() => handleSwitchOrg(org.id)}
                activeOpacity={0.7}
                disabled={switchingOrg !== null}
                accessibilityRole="button"
                accessibilityState={{ selected: activeOrgId === org.id }}
              >
                <View style={styles.orgInfo}>
                  <Text style={styles.orgName}>{org.name}</Text>
                  <Text style={styles.orgCode}>{org.org_code}</Text>
                </View>
                {switchingOrg === org.id ? (
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.primary.maroon}
                  />
                ) : activeOrgId === org.id ? (
                  <View style={styles.activeIndicator}>
                    <Feather
                      name="check"
                      size={14}
                      color={theme.colors.text.onImmersive}
                    />
                  </View>
                ) : null}
              </TouchableOpacity>
            </View>
          ))}
          {organizations.length > 0 && <View style={styles.divider} />}
          <SettingsItem
            styles={styles}
            theme={theme}
            icon="plus-circle"
            title="Add Organization"
            subtitle="Join another organization"
            onPress={handleAddOrganization}
          />
        </GlassSurface>

        {/* Preferences Section */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <GlassSurface variant="strong" padding="none" radius={borderRadius.xl}>
          <SettingsItem
            styles={styles}
            theme={theme}
            icon="bell"
            title="Notifications"
            subtitle="Manage push notifications"
            onPress={() => router.push('/notification-settings')}
          />
        </GlassSurface>

        {/* Support Section */}
        <Text style={styles.sectionTitle}>Support</Text>
        <GlassSurface variant="strong" padding="none" radius={borderRadius.xl}>
          <SettingsItem
            styles={styles}
            theme={theme}
            icon="help-circle"
            title="Help & FAQ"
            onPress={() => WebBrowser.openBrowserAsync(HELP_URL)}
          />
          <View style={styles.divider} />
          <SettingsItem
            styles={styles}
            theme={theme}
            icon="mail"
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
            styles={styles}
            theme={theme}
            icon="shield"
            title="Privacy Policy"
            onPress={() => WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL)}
          />
          <View style={styles.divider} />
          <SettingsItem
            styles={styles}
            theme={theme}
            icon="file-text"
            title="Terms of Service"
            onPress={() => WebBrowser.openBrowserAsync(TERMS_OF_SERVICE_URL)}
          />
        </GlassSurface>

        {/* Sign Out */}
        <GlassSurface
          variant="strong"
          padding="none"
          radius={borderRadius.xl}
          style={styles.signOutCard}
        >
          <SettingsItem
            styles={styles}
            theme={theme}
            icon="log-out"
            title="Sign Out"
            onPress={handleSignOut}
            showArrow={false}
            danger
          />
        </GlassSurface>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Sanctum v1.0.0</Text>
          <Text style={styles.versionSubtext}>Made with ❤️</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      paddingHorizontal: spacing.lg,
    },

    // Section
    sectionTitle: {
      fontSize: typography.size.xs,
      fontWeight: typography.weight.semibold,
      color: theme.colors.text.tertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: spacing.sm,
      marginTop: spacing.lg,
      marginLeft: spacing.xs,
    },

    // Settings Item
    settingsItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm + 4,
      padding: spacing.md,
    },
    itemIcon: {
      width: 32,
      height: 32,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.scheme === 'dark'
          ? 'rgba(210, 160, 185, 0.14)'
          : 'rgba(74, 32, 64, 0.08)',
    },
    itemIconDanger: {
      backgroundColor: theme.colors.semantic.errorLight,
    },
    settingsItemContent: {
      flex: 1,
    },
    settingsItemTitle: {
      fontSize: typography.size.md,
      fontWeight: typography.weight.medium,
      color: theme.colors.text.primary,
    },
    settingsItemSubtitle: {
      fontSize: typography.size.sm,
      color: theme.colors.text.tertiary,
      marginTop: 2,
    },
    dangerText: {
      color: theme.colors.semantic.error,
    },
    signOutCard: {
      marginTop: spacing.lg,
    },

    // Appearance
    appearanceCard: {
      gap: spacing.md,
    },
    appearanceHint: {
      fontSize: typography.size.sm,
      color: theme.colors.text.secondary,
    },
    segmented: {
      flexDirection: 'row',
      backgroundColor: theme.colors.background.tertiary,
      borderRadius: borderRadius.full,
      padding: 3,
      gap: 3,
    },
    segment: {
      flex: 1,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      alignItems: 'center',
    },
    segmentSelected: {
      backgroundColor: theme.colors.primary.maroon,
    },
    segmentText: {
      fontSize: typography.size.sm,
      fontWeight: typography.weight.medium,
      color: theme.colors.text.secondary,
    },
    segmentTextSelected: {
      color: theme.colors.text.inverse,
      fontWeight: typography.weight.semibold,
    },

    // Divider
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.utility.divider,
      marginLeft: spacing.md + 32 + spacing.sm + 4,
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
      color: theme.colors.text.primary,
    },
    orgCode: {
      fontSize: typography.size.sm,
      color: theme.colors.text.tertiary,
      marginTop: 2,
      letterSpacing: 1,
    },
    activeIndicator: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.semantic.success,
      justifyContent: 'center',
      alignItems: 'center',
    },

    // Version
    versionContainer: {
      alignItems: 'center',
      marginTop: spacing.xxl,
      paddingBottom: spacing.lg,
    },
    versionText: {
      fontSize: typography.size.sm,
      color: theme.colors.text.tertiary,
    },
    versionSubtext: {
      fontSize: typography.size.xs,
      color: theme.colors.text.tertiary,
      marginTop: spacing.xs,
    },
  });
