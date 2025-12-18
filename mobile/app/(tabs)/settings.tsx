import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
import { Card, Avatar, Button } from '../../src/components';
import { supabase } from '../../src/lib/supabase';

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
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleSignOut() {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            try {
              await supabase.auth.signOut();
              router.replace('/');
            } catch (err) {
              console.error('Sign out error:', err);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            } finally {
              setLoggingOut(false);
            }
          },
        },
      ]
    );
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
            // TODO: Navigate to change phone
            console.log('Change phone');
          }}
        />
      </Card>

      {/* Preferences Section */}
      <Text style={styles.sectionTitle}>Preferences</Text>
      <Card style={styles.sectionCard} padding="none">
        <SettingsItem
          title="Notifications"
          subtitle="Manage push notifications"
          onPress={() => {
            // TODO: Navigate to notifications settings
            console.log('Notifications');
          }}
        />
      </Card>

      {/* Support Section */}
      <Text style={styles.sectionTitle}>Support</Text>
      <Card style={styles.sectionCard} padding="none">
        <SettingsItem
          title="Help & FAQ"
          onPress={() => {
            // TODO: Navigate to help
            console.log('Help');
          }}
        />
        <View style={styles.divider} />
        <SettingsItem
          title="Contact Us"
          onPress={() => {
            // TODO: Open contact options
            console.log('Contact');
          }}
        />
        <View style={styles.divider} />
        <SettingsItem
          title="Privacy Policy"
          onPress={() => {
            // TODO: Open privacy policy
            console.log('Privacy');
          }}
        />
        <View style={styles.divider} />
        <SettingsItem
          title="Terms of Service"
          onPress={() => {
            // TODO: Open terms
            console.log('Terms');
          }}
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
        <Text style={styles.versionText}>Mandir App v1.0.0</Text>
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
