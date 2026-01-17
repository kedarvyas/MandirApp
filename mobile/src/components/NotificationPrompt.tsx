import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing } from '../constants/theme';
import { Button } from './Button';
import { Card } from './Card';

const PROMPT_KEY = '@Sanctum:notificationPromptShown';

interface NotificationPromptProps {
  memberId?: string;
  onComplete?: (enabled: boolean) => void;
}

export function NotificationPrompt({ memberId, onComplete }: NotificationPromptProps) {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  useEffect(() => {
    checkIfShouldShow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkIfShouldShow() {
    // Don't show in simulator
    if (!Device.isDevice) {
      return;
    }

    // Check if we've already shown the prompt
    const shown = await AsyncStorage.getItem(PROMPT_KEY);
    if (shown === 'true') {
      return;
    }

    // Show the prompt with a small delay
    setTimeout(() => {
      setVisible(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1000);
  }

  async function handleEnable() {
    setLoading(true);
    try {

      // We'll use the registerForPushNotificationsAsync function directly
      const Notifications = await import('expo-notifications');
      const { status } = await Notifications.requestPermissionsAsync();

      if (status === 'granted') {
        const tokenResponse = await Notifications.getExpoPushTokenAsync({
          projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
        });

        // Save preference
        await AsyncStorage.setItem('@Sanctum:notificationsEnabled', 'true');

        // Save token to database if we have memberId
        if (memberId && tokenResponse.data) {
          const { supabase } = await import('../lib/supabase');
          await supabase
            .from('members')
            .update({
              push_token: tokenResponse.data,
              notifications_enabled: true,
            })
            .eq('id', memberId);
        }

        onComplete?.(true);
      } else {
        onComplete?.(false);
      }
    } catch (err) {
      console.error('Error enabling notifications:', err);
      onComplete?.(false);
    } finally {
      await AsyncStorage.setItem(PROMPT_KEY, 'true');
      dismiss();
    }
  }

  async function handleSkip() {
    await AsyncStorage.setItem(PROMPT_KEY, 'true');
    onComplete?.(false);
    dismiss();
  }

  function dismiss() {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      setLoading(false);
    });
  }

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleSkip}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View
          style={[
            styles.container,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Card style={styles.card}>
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Feather name="bell" size={32} color={colors.utility.white} />
              </View>
            </View>

            <Text style={styles.title}>Stay in the Loop</Text>
            <Text style={styles.description}>
              Get notified about announcements, events, and updates from your organization.
            </Text>

            <View style={styles.features}>
              <View style={styles.featureRow}>
                <Feather name="check" size={16} color={colors.semantic.success} />
                <Text style={styles.featureText}>Organization announcements</Text>
              </View>
              <View style={styles.featureRow}>
                <Feather name="check" size={16} color={colors.semantic.success} />
                <Text style={styles.featureText}>Event reminders</Text>
              </View>
              <View style={styles.featureRow}>
                <Feather name="check" size={16} color={colors.semantic.success} />
                <Text style={styles.featureText}>Check-in confirmations</Text>
              </View>
            </View>

            <Button
              title="Enable Notifications"
              onPress={handleEnable}
              variant="primary"
              loading={loading}
              style={styles.enableButton}
            />

            <Button
              title="Maybe Later"
              onPress={handleSkip}
              variant="text"
              disabled={loading}
            />
          </Card>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  container: {
    width: '100%',
    maxWidth: 340,
  },
  card: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },

  // Icon
  iconContainer: {
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary.maroon,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary.maroon,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // Content
  title: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },

  // Features
  features: {
    alignSelf: 'stretch',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureText: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },

  // Buttons
  enableButton: {
    alignSelf: 'stretch',
    marginBottom: spacing.sm,
  },
});
