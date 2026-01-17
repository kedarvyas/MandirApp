import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import * as Device from 'expo-device';
import { colors, typography, spacing } from '../src/constants/theme';
import { Card, Button } from '../src/components';
import { useNotifications } from '../src/lib/notifications';
import { supabase } from '../src/lib/supabase';

export default function NotificationSettingsScreen() {
  const [memberId, setMemberId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    permissionStatus,
    isNotificationsEnabled,
    isLoading,
    updateNotificationPreference,
    registerForPushNotifications,
  } = useNotifications(memberId || undefined);

  useFocusEffect(
    useCallback(() => {
      loadMemberId();
    }, [])
  );

  async function loadMemberId() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('members')
        .select('id')
        .eq('phone', user.phone)
        .single();
      if (data) {
        setMemberId(data.id);
      }
    }
  }

  const handleToggleNotifications = async (value: boolean) => {
    if (!Device.isDevice) {
      Alert.alert(
        'Physical Device Required',
        'Push notifications only work on physical devices, not simulators.'
      );
      return;
    }

    // Check if we need to request permissions first
    if (value && permissionStatus !== 'granted') {
      Alert.alert(
        'Enable Notifications',
        'To receive notifications, please allow notifications in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              } else {
                Linking.openSettings();
              }
            },
          },
        ]
      );
      return;
    }

    setIsUpdating(true);
    try {
      await updateNotificationPreference(value);

      if (value) {
        Alert.alert('Notifications Enabled', 'You will now receive push notifications.');
      }
    } catch {
      Alert.alert('Error', 'Failed to update notification settings. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRequestPermission = async () => {
    if (!Device.isDevice) {
      Alert.alert(
        'Physical Device Required',
        'Push notifications only work on physical devices, not simulators.'
      );
      return;
    }

    setIsUpdating(true);
    try {
      const token = await registerForPushNotifications();
      if (token) {
        Alert.alert('Success', 'Push notifications have been enabled!');
      } else {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              },
            },
          ]
        );
      }
    } catch {
      Alert.alert('Error', 'Failed to enable notifications.');
    } finally {
      setIsUpdating(false);
    }
  };

  const permissionGranted = permissionStatus === 'granted';

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Notifications',
          headerStyle: { backgroundColor: colors.background.primary },
          headerTintColor: colors.primary.maroon,
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* Main Toggle */}
        <Card style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Feather name="bell" size={24} color={colors.primary.maroon} />
              <View style={styles.toggleText}>
                <Text style={styles.toggleTitle}>Push Notifications</Text>
                <Text style={styles.toggleSubtitle}>
                  Receive updates from your organization
                </Text>
              </View>
            </View>
            <Switch
              value={isNotificationsEnabled && permissionGranted}
              onValueChange={handleToggleNotifications}
              trackColor={{
                false: colors.utility.divider,
                true: colors.semantic.success,
              }}
              thumbColor={colors.utility.white}
              disabled={isLoading || isUpdating}
            />
          </View>
        </Card>

        {/* Permission Status */}
        {!permissionGranted && (
          <Card style={styles.card}>
            <View style={styles.permissionCard}>
              <View style={styles.permissionIcon}>
                <Feather name="alert-circle" size={24} color={colors.semantic.warning} />
              </View>
              <Text style={styles.permissionTitle}>Notifications Disabled</Text>
              <Text style={styles.permissionText}>
                Push notifications are disabled in your device settings. Enable them to receive
                important updates from your organization.
              </Text>
              <Button
                title="Enable Notifications"
                onPress={handleRequestPermission}
                variant="primary"
                loading={isUpdating}
                style={styles.permissionButton}
              />
            </View>
          </Card>
        )}

        {/* Notification Types Info */}
        <Text style={styles.sectionTitle}>What You'll Receive</Text>
        <Card style={styles.card} padding="none">
          <View style={styles.typeItem}>
            <Feather name="radio" size={20} color={colors.primary.plum} />
            <View style={styles.typeInfo}>
              <Text style={styles.typeTitle}>Announcements</Text>
              <Text style={styles.typeSubtitle}>
                News and updates from your organization
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.typeItem}>
            <Feather name="check-circle" size={20} color={colors.semantic.success} />
            <View style={styles.typeInfo}>
              <Text style={styles.typeTitle}>Check-in Confirmations</Text>
              <Text style={styles.typeSubtitle}>
                Confirmation when you check in
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.typeItem}>
            <Feather name="calendar" size={20} color={colors.accent.rose} />
            <View style={styles.typeInfo}>
              <Text style={styles.typeTitle}>Event Reminders</Text>
              <Text style={styles.typeSubtitle}>
                Reminders for upcoming events
              </Text>
            </View>
          </View>
        </Card>

        {/* Privacy Note */}
        <View style={styles.privacyNote}>
          <Feather name="shield" size={16} color={colors.text.tertiary} />
          <Text style={styles.privacyText}>
            We respect your privacy. You can disable notifications at any time.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    padding: spacing.lg,
  },
  card: {
    marginBottom: spacing.md,
  },

  // Toggle Row
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  toggleTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  },
  toggleSubtitle: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    marginTop: 2,
  },

  // Permission Card
  permissionCard: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  permissionIcon: {
    marginBottom: spacing.sm,
  },
  permissionTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  permissionText: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  permissionButton: {
    minWidth: 200,
  },

  // Section
  sectionTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    marginLeft: spacing.xs,
  },

  // Notification Types
  typeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  typeInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  typeTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    color: colors.text.primary,
  },
  typeSubtitle: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.utility.divider,
    marginLeft: spacing.md + 20 + spacing.md,
  },

  // Privacy Note
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  privacyText: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    marginLeft: spacing.sm,
    flex: 1,
    textAlign: 'center',
  },
});
