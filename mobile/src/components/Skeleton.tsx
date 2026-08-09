import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  borderRadius,
  spacing,
  Theme,
} from '../constants/theme';
import { useTheme } from '../lib/themeContext';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Base Skeleton component with shimmer animation
 */
export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius: radius = borderRadius.sm,
  style,
}: SkeletonProps) {
  const theme = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          backgroundColor: theme.colors.background.tertiary,
          width,
          height,
          borderRadius: radius,
          opacity,
        },
        style,
      ]}
    />
  );
}

/**
 * Circular skeleton for avatars
 */
export function SkeletonAvatar({ size = 48 }: { size?: number }) {
  return (
    <Skeleton
      width={size}
      height={size}
      borderRadius={size / 2}
    />
  );
}

/**
 * Text line skeleton
 */
export function SkeletonText({
  width = '100%',
  height = 16,
  style,
}: {
  width?: DimensionValue;
  height?: number;
  style?: ViewStyle;
}) {
  return (
    <Skeleton
      width={width}
      height={height}
      borderRadius={borderRadius.xs}
      style={style}
    />
  );
}

/**
 * Skeleton for the Home screen profile card
 */
export function SkeletonProfileCard() {
  const styles = useSkeletonStyles();
  return (
    <View style={styles.profileCard}>
      <View style={styles.profileRow}>
        <SkeletonAvatar size={64} />
        <View style={styles.profileInfo}>
          <SkeletonText width="70%" height={20} style={{ marginBottom: spacing.xs }} />
          <SkeletonText width="50%" height={14} style={{ marginBottom: spacing.sm }} />
          <Skeleton width={80} height={24} borderRadius={borderRadius.full} />
        </View>
      </View>
    </View>
  );
}

/**
 * Skeleton for the QR code card
 */
export function SkeletonQRCard() {
  const styles = useSkeletonStyles();
  return (
    <View style={styles.qrCard}>
      <SkeletonText width={160} height={20} style={{ marginBottom: spacing.xs, alignSelf: 'center' }} />
      <SkeletonText width={200} height={14} style={{ marginBottom: spacing.lg, alignSelf: 'center' }} />
      <View style={styles.qrWrapper}>
        <Skeleton width={190} height={190} borderRadius={borderRadius.lg} />
      </View>
      <SkeletonText width={180} height={12} style={{ marginTop: spacing.md, alignSelf: 'center' }} />
    </View>
  );
}

/**
 * Skeleton for info card rows
 */
export function SkeletonInfoCard() {
  const styles = useSkeletonStyles();
  return (
    <View style={styles.infoCard}>
      <View style={styles.infoRow}>
        <SkeletonText width={60} height={14} />
        <SkeletonText width={120} height={14} />
      </View>
      <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
        <SkeletonText width={50} height={14} />
        <SkeletonText width={150} height={14} />
      </View>
    </View>
  );
}

/**
 * Skeleton for family member card
 */
export function SkeletonMemberCard() {
  const styles = useSkeletonStyles();
  return (
    <View style={styles.memberCard}>
      <View style={styles.memberRow}>
        <SkeletonAvatar size={48} />
        <View style={styles.memberInfo}>
          <SkeletonText width="60%" height={16} style={{ marginBottom: spacing.xs }} />
          <View style={styles.badgeRow}>
            <Skeleton width={50} height={20} borderRadius={borderRadius.full} />
            <Skeleton width={70} height={20} borderRadius={borderRadius.full} style={{ marginLeft: spacing.xs }} />
          </View>
        </View>
        <Skeleton width={32} height={32} borderRadius={16} />
      </View>
    </View>
  );
}

/**
 * Skeleton for news card
 */
export function SkeletonNewsCard() {
  const styles = useSkeletonStyles();
  return (
    <View style={styles.newsCard}>
      <Skeleton width="100%" height={180} borderRadius={0} />
      <View style={styles.newsContent}>
        <View style={styles.newsHeader}>
          <SkeletonText width={60} height={12} />
          <SkeletonText width={80} height={12} />
        </View>
        <SkeletonText width="90%" height={18} style={{ marginBottom: spacing.sm }} />
        <SkeletonText width="100%" height={14} style={{ marginBottom: spacing.xs }} />
        <SkeletonText width="100%" height={14} style={{ marginBottom: spacing.xs }} />
        <SkeletonText width="70%" height={14} />
      </View>
    </View>
  );
}

/**
 * Full Home screen skeleton.
 *
 * Mirrors the real layout -- a deep hero with the pass card riding up over its
 * bottom edge -- so the screen does not visibly reflow once data lands.
 */
export function SkeletonHomeScreen() {
  const styles = useSkeletonStyles();
  const insets = useSafeAreaInsets();
  return (
    <View>
      <View style={[styles.hero, { paddingTop: insets.top + spacing.md }]} />
      <View style={styles.passArea}>
        <SkeletonProfileCard />
        <SkeletonQRCard />
        <SkeletonInfoCard />
      </View>
    </View>
  );
}

/**
 * Full Family screen skeleton
 */
export function SkeletonFamilyScreen() {
  const styles = useSkeletonStyles();
  return (
    <View style={styles.screenContainer}>
      <View style={styles.header}>
        <SkeletonText width={140} height={24} style={{ marginBottom: spacing.xs }} />
        <SkeletonText width={260} height={16} />
      </View>
      <SkeletonMemberCard />
      <SkeletonText width={140} height={18} style={{ marginTop: spacing.lg, marginBottom: spacing.md }} />
      <SkeletonMemberCard />
      <SkeletonMemberCard />
    </View>
  );
}

/**
 * Full News screen skeleton
 */
export function SkeletonNewsScreen() {
  const styles = useSkeletonStyles();
  return (
    <View style={styles.screenContainer}>
      <SkeletonNewsCard />
      <SkeletonNewsCard />
    </View>
  );
}

function useSkeletonStyles() {
  const theme = useTheme();
  return React.useMemo(() => createStyles(theme), [theme]);
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    screenContainer: {
      padding: spacing.lg,
    },

    // Home hero
    hero: {
      height: 190,
      backgroundColor: theme.backdrop.hero[0],
      borderBottomLeftRadius: borderRadius.xxl,
      borderBottomRightRadius: borderRadius.xxl,
    },
    passArea: {
      paddingHorizontal: spacing.lg,
      marginTop: -52,
    },

    // Profile Card
    profileCard: {
      backgroundColor: theme.glass.fallback,
      borderRadius: borderRadius.xl,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    profileRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    profileInfo: {
      flex: 1,
      marginLeft: spacing.md,
    },

    // QR Card
    qrCard: {
      backgroundColor: theme.glass.fallback,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      marginBottom: spacing.md,
      alignItems: 'center',
    },
    qrWrapper: {
      padding: spacing.md,
      backgroundColor: theme.colors.utility.white,
      borderRadius: borderRadius.lg,
    },

    // Info Card
    infoCard: {
      backgroundColor: theme.glass.fallback,
      borderRadius: borderRadius.xl,
      padding: spacing.md,
      marginBottom: spacing.lg,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.utility.divider,
    },

    // Member Card
    memberCard: {
      backgroundColor: theme.glass.fallback,
      borderRadius: borderRadius.xl,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    memberRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    memberInfo: {
      flex: 1,
      marginLeft: spacing.md,
    },
    badgeRow: {
      flexDirection: 'row',
    },

    // News Card
    newsCard: {
      backgroundColor: theme.glass.fallback,
      borderRadius: borderRadius.xl,
      marginBottom: spacing.md,
      overflow: 'hidden',
    },
    newsContent: {
      padding: spacing.md,
    },
    newsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },

    // Header
    header: {
      marginBottom: spacing.lg,
    },
  });

export default Skeleton;
