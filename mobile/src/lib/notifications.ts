import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const NOTIFICATION_PROMPT_KEY = '@Sanctum:notificationPromptShown';
const NOTIFICATIONS_ENABLED_KEY = '@Sanctum:notificationsEnabled';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  type?: 'announcement' | 'check_in' | 'reminder' | 'general';
  announcementId?: string;
  memberId?: string;
  organizationId?: string;
  [key: string]: unknown;
}

export interface UseNotificationsResult {
  expoPushToken: string | null;
  permissionStatus: Notifications.PermissionStatus | null;
  isLoading: boolean;
  error: string | null;
  requestPermissions: () => Promise<boolean>;
  registerForPushNotifications: () => Promise<string | null>;
  updateNotificationPreference: (enabled: boolean) => Promise<void>;
  isNotificationsEnabled: boolean;
  hasPromptedBefore: boolean;
}

/**
 * Register for push notifications and get the Expo push token
 */
async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  // Must be a physical device for push notifications
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  // Check current permission status
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permission if not already granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission not granted');
    return null;
  }

  try {
    // Get the Expo push token
    const tokenResponse = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });
    token = tokenResponse.data;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }

  // Set up Android notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4A2040',
    });

    await Notifications.setNotificationChannelAsync('announcements', {
      name: 'Announcements',
      description: 'Organization announcements and news',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4A2040',
    });

    await Notifications.setNotificationChannelAsync('check_ins', {
      name: 'Check-ins',
      description: 'Check-in confirmations',
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: '#4A7C59',
    });
  }

  return token;
}

/**
 * Save push token to the database for the current member
 */
async function savePushTokenToDatabase(
  memberId: string,
  pushToken: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('members')
      .update({
        push_token: pushToken,
        notifications_enabled: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', memberId);

    if (error) {
      console.error('Error saving push token:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('savePushTokenToDatabase error:', err);
    return false;
  }
}

/**
 * Remove push token from the database (used when disabling notifications)
 */
async function removePushTokenFromDatabase(memberId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('members')
      .update({
        push_token: null,
        notifications_enabled: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', memberId);

    if (error) {
      console.error('Error removing push token:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('removePushTokenFromDatabase error:', err);
    return false;
  }
}

/**
 * Handle notification tap - navigate to appropriate screen
 */
function handleNotificationResponse(
  response: Notifications.NotificationResponse
): void {
  const data = response.notification.request.content.data as NotificationData;

  switch (data?.type) {
    case 'announcement':
      // Navigate to news tab
      router.push('/(tabs)/news');
      break;
    case 'check_in':
      // Navigate to home tab
      router.push('/(tabs)');
      break;
    default:
      // Default to home
      router.push('/(tabs)');
      break;
  }
}

/**
 * Hook to manage push notifications
 */
export function useNotifications(memberId?: string): UseNotificationsResult {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] =
    useState<Notifications.PermissionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [hasPromptedBefore, setHasPromptedBefore] = useState(false);

  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  // Check initial state
  useEffect(() => {
    async function checkState() {
      try {
        // Check if we've prompted before
        const prompted = await AsyncStorage.getItem(NOTIFICATION_PROMPT_KEY);
        setHasPromptedBefore(prompted === 'true');

        // Check local preference
        const enabled = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
        setIsNotificationsEnabled(enabled === 'true');

        // Check current permission status
        const { status } = await Notifications.getPermissionsAsync();
        setPermissionStatus(status);

        // If permissions granted and enabled, get the token
        if (status === 'granted' && enabled === 'true') {
          const token = await registerForPushNotificationsAsync();
          setExpoPushToken(token);
        }
      } catch (err) {
        console.error('Error checking notification state:', err);
        setError('Failed to check notification status');
      } finally {
        setIsLoading(false);
      }
    }

    checkState();
  }, []);

  // Set up notification listeners (only on physical devices)
  useEffect(() => {
    // Skip listener setup in Expo Go / simulators where it's not fully supported
    if (!Device.isDevice) {
      return;
    }

    try {
      // Listen for notifications received while app is foregrounded
      notificationListener.current = Notifications.addNotificationReceivedListener(
        (notification) => {
          console.log('Notification received:', notification);
        }
      );

      // Listen for notification taps
      responseListener.current = Notifications.addNotificationResponseReceivedListener(
        handleNotificationResponse
      );
    } catch (err) {
      console.warn('Failed to set up notification listeners:', err);
    }

    return () => {
      try {
        if (notificationListener.current) {
          notificationListener.current.remove();
        }
        if (responseListener.current) {
          responseListener.current.remove();
        }
      } catch (err) {
        // Ignore cleanup errors in Expo Go
      }
    };
  }, []);

  /**
   * Request notification permissions
   */
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Mark that we've prompted
      await AsyncStorage.setItem(NOTIFICATION_PROMPT_KEY, 'true');
      setHasPromptedBefore(true);

      if (!Device.isDevice) {
        setError('Push notifications require a physical device');
        return false;
      }

      const { status } = await Notifications.requestPermissionsAsync();
      setPermissionStatus(status);

      if (status === 'granted') {
        await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, 'true');
        setIsNotificationsEnabled(true);
        return true;
      }

      return false;
    } catch (err) {
      console.error('Error requesting permissions:', err);
      setError('Failed to request notification permissions');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Full registration flow - request permissions and save token
   */
  const registerForPushNotifications = useCallback(async (): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await registerForPushNotificationsAsync();

      if (token) {
        setExpoPushToken(token);
        await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, 'true');
        setIsNotificationsEnabled(true);

        // Save to database if we have a member ID
        if (memberId) {
          await savePushTokenToDatabase(memberId, token);
        }

        return token;
      }

      return null;
    } catch (err) {
      console.error('Error registering for push notifications:', err);
      setError('Failed to register for push notifications');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [memberId]);

  /**
   * Update notification preference (enable/disable)
   */
  const updateNotificationPreference = useCallback(
    async (enabled: boolean): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        if (enabled) {
          // Enable notifications
          const token = await registerForPushNotificationsAsync();
          if (token) {
            setExpoPushToken(token);
            await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, 'true');
            setIsNotificationsEnabled(true);

            if (memberId) {
              await savePushTokenToDatabase(memberId, token);
            }
          } else {
            throw new Error('Could not enable notifications');
          }
        } else {
          // Disable notifications
          await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, 'false');
          setIsNotificationsEnabled(false);
          setExpoPushToken(null);

          if (memberId) {
            await removePushTokenFromDatabase(memberId);
          }
        }
      } catch (err) {
        console.error('Error updating notification preference:', err);
        setError('Failed to update notification settings');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [memberId]
  );

  return {
    expoPushToken,
    permissionStatus,
    isLoading,
    error,
    requestPermissions,
    registerForPushNotifications,
    updateNotificationPreference,
    isNotificationsEnabled,
    hasPromptedBefore,
  };
}

/**
 * Utility function to send a local notification (for testing)
 */
export async function sendLocalNotification(
  title: string,
  body: string,
  data?: NotificationData
): Promise<string> {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data || {},
      sound: true,
    },
    trigger: null, // Immediate
  });
}

/**
 * Get the current badge count
 */
export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

/**
 * Set the badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Clear all notifications
 */
export async function clearAllNotifications(): Promise<void> {
  await Notifications.dismissAllNotificationsAsync();
  await Notifications.setBadgeCountAsync(0);
}
