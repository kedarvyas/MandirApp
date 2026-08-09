import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  borderRadius,
  spacing,
  TAB_BAR_HEIGHT,
  Theme,
  typography,
} from '../constants/theme';
import { useTheme, useThemedStyles } from '../lib/themeContext';
import { GlassSurface } from './GlassSurface';

/**
 * A floating glass tab bar.
 *
 * It sits *over* the content rather than reserving space at the bottom of the
 * screen, so scrolling content passes behind the blur. Screens must therefore
 * pad their scroll content by `useTabBarInset()`.
 */

/** Icon per route, keyed by the expo-router screen name. */
const ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  index: 'credit-card',
  news: 'bell',
  family: 'users',
  settings: 'settings',
};

/** Gap between the floating bar and the bottom of the safe area. */
const BOTTOM_GAP = 10;

/** Space a scroll view must leave at the bottom so the bar never covers content. */
export function useTabBarInset(): number {
  const insets = useSafeAreaInsets();
  return TAB_BAR_HEIGHT + BOTTOM_GAP + Math.max(insets.bottom, spacing.sm);
}

// The shape of what react-navigation hands a custom tabBar, narrowed to the
// parts used here. Typing it locally avoids depending on @react-navigation
// types that this package does not declare directly.
interface TabBarProps {
  state: {
    index: number;
    routes: { key: string; name: string }[];
  };
  descriptors: Record<
    string,
    { options: { title?: string; tabBarLabel?: unknown; href?: string | null } }
  >;
  navigation: {
    emit: (event: {
      type: 'tabPress';
      target: string;
      canPreventDefault: true;
    }) => { defaultPrevented: boolean };
    navigate: (name: string, params?: object) => void;
  };
}

export function GlassTabBar({ state, descriptors, navigation }: TabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useThemedStyles(createStyles);

  // expo-router marks a screen as hidden with `href: null`; those routes still
  // exist in navigation state, so they have to be filtered out here.
  const visibleRoutes = state.routes.filter(
    (route) => descriptors[route.key]?.options.href !== null
  );

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        { bottom: Math.max(insets.bottom, spacing.sm) + BOTTOM_GAP },
      ]}
    >
      <GlassSurface
        variant="strong"
        padding="none"
        radius={borderRadius.full}
        elevation="lg"
        intensity={theme.glass.chromeIntensity}
        sheen={false}
        style={styles.bar}
        contentStyle={styles.barContent}
      >
        {visibleRoutes.map((route) => {
          const { options } = descriptors[route.key];
          const isFocused = state.routes[state.index]?.key === route.key;
          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : (options.title ?? route.name);

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate(route.name);
            }
          };

          const color = isFocused
            ? theme.colors.primary.maroon
            : theme.colors.text.tertiary;

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.item}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={label}
            >
              <View style={[styles.itemInner, isFocused && styles.itemActive]}>
                <Feather
                  name={ICONS[route.name] ?? 'circle'}
                  size={21}
                  color={color}
                />
                <Text style={[styles.label, { color }]} numberOfLines={1}>
                  {label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </GlassSurface>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    wrapper: {
      position: 'absolute',
      left: spacing.md,
      right: spacing.md,
    },
    bar: {
      // The shadow wrapper needs the radius too, or iOS draws a square shadow.
      borderRadius: borderRadius.full,
    },
    barContent: {
      height: TAB_BAR_HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.xs,
    },
    item: {
      flex: 1,
      height: '100%',
      justifyContent: 'center',
    },
    itemInner: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3,
      marginVertical: spacing.xs + 2,
      marginHorizontal: 2,
      borderRadius: borderRadius.full,
      paddingVertical: spacing.xs,
    },
    itemActive: {
      backgroundColor:
        theme.scheme === 'dark'
          ? 'rgba(210, 160, 185, 0.16)'
          : 'rgba(74, 32, 64, 0.09)',
    },
    label: {
      fontSize: 11,
      fontWeight: typography.weight.medium,
      letterSpacing: 0.1,
    },
  });

export default GlassTabBar;
