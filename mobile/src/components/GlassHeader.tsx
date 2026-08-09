import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { spacing, Theme, typography } from '../constants/theme';
import { useTheme, useThemedStyles } from '../lib/themeContext';

/**
 * A header the content scrolls *underneath*.
 *
 * That overlap is the whole point: a glass bar sitting above the content with
 * nothing passing behind it is just an opaque bar with extra cost. Screens
 * using this must pad their scroll content by `useHeaderHeight()`.
 */

const CAN_BLUR = Platform.OS === 'ios';

/** Header height below the status bar. */
export const HEADER_CONTENT_HEIGHT = 56;

/** Total header height, including the status bar inset. */
export function useHeaderHeight(): number {
  return useSafeAreaInsets().top + HEADER_CONTENT_HEIGHT;
}

interface GlassHeaderProps {
  title: string;
  subtitle?: string;
  /** Renders a back chevron on the left when provided. */
  onBack?: () => void;
  /** Optional trailing control, e.g. an edit or add button. */
  right?: React.ReactNode;
}

export function GlassHeader({
  title,
  subtitle,
  onBack,
  right,
}: GlassHeaderProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useThemedStyles(createStyles);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBack?.();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {CAN_BLUR ? (
        <BlurView
          intensity={theme.glass.chromeIntensity}
          tint={theme.glass.tint}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <View style={styles.tint} />

      <View style={styles.row}>
        <View style={styles.side}>
          {onBack ? (
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              activeOpacity={0.7}
            >
              <Feather
                name="chevron-left"
                size={26}
                color={theme.colors.text.primary}
              />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={[styles.side, styles.sideRight]}>{right}</View>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.utility.divider,
      overflow: 'hidden',
    },
    tint: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: CAN_BLUR
        ? theme.glass.surface
        : theme.glass.fallback,
    },
    row: {
      height: HEADER_CONTENT_HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
    },
    // Fixed, equal side columns keep the title optically centred no matter
    // what the leading and trailing controls happen to be.
    side: {
      width: 44,
      justifyContent: 'center',
    },
    sideRight: {
      alignItems: 'flex-end',
    },
    backButton: {
      marginLeft: -spacing.xs,
    },
    titleBlock: {
      flex: 1,
      alignItems: 'center',
    },
    title: {
      fontSize: typography.size.lg,
      fontWeight: typography.weight.semibold,
      color: theme.colors.text.primary,
      letterSpacing: 0.2,
    },
    subtitle: {
      fontSize: typography.size.xs,
      color: theme.colors.text.tertiary,
      marginTop: 1,
    },
  });

export default GlassHeader;
