import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, typography, spacing } from '../constants/theme';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  route?: string;
  onPress?: () => void;
}

export function DrawerMenu({ isOpen, onClose }: DrawerMenuProps) {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-SCREEN_HEIGHT)).current;

  const menuItems: MenuItem[] = [
    {
      id: 'organizations',
      label: 'My Organizations',
      icon: 'home',
      route: '/organizations',
    },
    {
      id: 'family',
      label: 'Family',
      icon: 'users',
      route: '/(tabs)/family',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'settings',
      route: '/(tabs)/settings',
    },
  ];

  useEffect(() => {
    if (isOpen) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -SCREEN_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen]);

  const handleMenuItemPress = (item: MenuItem) => {
    onClose();
    setTimeout(() => {
      if (item.onPress) {
        item.onPress();
      } else if (item.route) {
        router.push(item.route as any);
      }
    }, 150);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Blur backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={onClose}
          />
        </BlurView>
      </Animated.View>

      {/* Menu content - slides from top */}
      <Animated.View
        style={[
          styles.menuContainer,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Header with close button */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Menu</Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="x" size={28} color={colors.text.inverse} />
          </TouchableOpacity>
        </View>

        {/* Menu items */}
        <View style={styles.menuItems}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => handleMenuItemPress(item)}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemIcon}>
                <Feather name={item.icon} size={24} color={colors.text.inverse} />
              </View>
              <Text style={styles.menuItemLabel}>{item.label}</Text>
              <Feather name="chevron-right" size={20} color={colors.text.inverse} style={{ opacity: 0.5 }} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Sanctum v1.0</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.primary.maroon,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingTop: Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight || 0) + 12,
    paddingBottom: spacing.xl,
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text.inverse,
    letterSpacing: 0.5,
  },
  closeButton: {
    padding: spacing.xs,
  },
  menuItems: {
    paddingTop: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  menuItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuItemLabel: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: colors.text.inverse,
    letterSpacing: 0.3,
  },
  footer: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  footerText: {
    fontSize: typography.size.sm,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
  },
});
