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
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Device from 'expo-device';
import {
  borderRadius,
  spacing,
  Theme,
  typography,
} from '../src/constants/theme';
import {
  Button,
  GlassHeader,
  GlassSurface,
  GradientBackdrop,
  useHeaderHeight,
} from '../src/components';
import { useTheme, useThemedStyles } from '../src/lib/themeContext';
import { useNotifications } from '../src/lib/notifications';
import { supabase } from '../src/lib/supabase';

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
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
    <View style={styles.container}>
      <GradientBackdrop />
      <GlassHeader
        title="Notifications"
        onBack={router.canGoBack() ? () => router.back() : undefined}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + spacing.lg,
            paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.lg,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Toggle */}
        <GlassSurface
          variant="strong"
          padding="md"
          radius={borderRadius.xl}
          style={styles.card}
        >
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Feather
                name="bell"
                size={22}
                color={theme.colors.primary.maroon}
              />
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
                false: theme.colors.background.tertiary,
                true: theme.colors.semantic.success,
              }}
              thumbColor={theme.colors.utility.white}
              disabled={isLoading || isUpdating}
            />
          </View>
        </GlassSurface>

        {/* Permission Status */}
        {!permissionGranted && (
          <GlassSurface
            variant="strong"
            padding="md"
            radius={borderRadius.xl}
            style={styles.card}
          >
            <View style={styles.permissionCard}>
              <View style={styles.permissionIcon}>
                <Feather
                  name="alert-circle"
                  size={24}
                  color={theme.colors.semantic.warning}
                />
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
          </GlassSurface>
        )}

        {/* Notification Types Info */}
        <Text style={styles.sectionTitle}>What you&apos;ll receive</Text>
        <GlassSurface
          variant="strong"
          padding="none"
          radius={borderRadius.xl}
          style={styles.card}
        >
          <View style={styles.typeItem}>
            <Feather
              name="radio"
              size={20}
              color={theme.colors.primary.plum}
            />
            <View style={styles.typeInfo}>
              <Text style={styles.typeTitle}>Announcements</Text>
              <Text style={styles.typeSubtitle}>
                News and updates from your organization
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.typeItem}>
            <Feather
              name="check-circle"
              size={20}
              color={theme.colors.semantic.success}
            />
            <View style={styles.typeInfo}>
              <Text style={styles.typeTitle}>Check-in Confirmations</Text>
              <Text style={styles.typeSubtitle}>
                Confirmation when you check in
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.typeItem}>
            <Feather
              name="calendar"
              size={20}
              color={theme.colors.accent.rose}
            />
            <View style={styles.typeInfo}>
              <Text style={styles.typeTitle}>Event Reminders</Text>
              <Text style={styles.typeSubtitle}>
                Reminders for upcoming events
              </Text>
            </View>
          </View>
        </GlassSurface>

        {/* Privacy Note */}
        <View style={styles.privacyNote}>
          <Feather name="shield" size={16} color={theme.colors.text.tertiary} />
          <Text style={styles.privacyText}>
            We respect your privacy. You can disable notifications at any time.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    content: {
      paddingHorizontal: spacing.lg,
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
      color: theme.colors.text.primary,
    },
    toggleSubtitle: {
      fontSize: typography.size.sm,
      color: theme.colors.text.tertiary,
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
      color: theme.colors.text.primary,
      marginBottom: spacing.xs,
    },
    permissionText: {
      fontSize: typography.size.sm,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginBottom: spacing.md,
      lineHeight: 20,
    },
    permissionButton: {
      minWidth: 200,
    },

    // Section
    sectionTitle: {
      fontSize: typography.size.xs,
      fontWeight: typography.weight.semibold,
      color: theme.colors.text.tertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
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
      color: theme.colors.text.primary,
    },
    typeSubtitle: {
      fontSize: typography.size.sm,
      color: theme.colors.text.tertiary,
      marginTop: 2,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.utility.divider,
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
      color: theme.colors.text.tertiary,
      marginLeft: spacing.sm,
      flex: 1,
      textAlign: 'center',
    },
  });
