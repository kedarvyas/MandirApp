import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import { colors, borderRadius, spacing } from '../constants/theme';

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
        styles.skeleton,
        {
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
  return (
    <View style={styles.qrCard}>
      <SkeletonText width={160} height={20} style={{ marginBottom: spacing.xs, alignSelf: 'center' }} />
      <SkeletonText width={200} height={14} style={{ marginBottom: spacing.lg, alignSelf: 'center' }} />
      <View style={styles.qrWrapper}>
        <Skeleton width={200} height={200} borderRadius={borderRadius.lg} />
      </View>
      <SkeletonText width={180} height={12} style={{ marginTop: spacing.md, alignSelf: 'center' }} />
    </View>
  );
}

/**
 * Skeleton for info card rows
 */
export function SkeletonInfoCard() {
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
  return (
    <View style={styles.newsCard}>
      <Skeleton width="100%" height={180} borderRadius={0} style={styles.newsImage} />
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
 * Full Home screen skeleton
 */
export function SkeletonHomeScreen() {
  return (
    <View style={styles.screenContainer}>
      <SkeletonProfileCard />
      <SkeletonText width={120} height={12} style={{ alignSelf: 'center', marginBottom: spacing.md }} />
      <SkeletonQRCard />
      <SkeletonInfoCard />
    </View>
  );
}

/**
 * Full Family screen skeleton
 */
export function SkeletonFamilyScreen() {
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
  return (
    <View style={styles.screenContainer}>
      <SkeletonNewsCard />
      <SkeletonNewsCard />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.background.tertiary,
  },
  screenContainer: {
    padding: spacing.lg,
  },

  // Profile Card
  profileCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
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
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  qrWrapper: {
    padding: spacing.md,
    backgroundColor: colors.utility.white,
    borderRadius: borderRadius.lg,
  },

  // Info Card
  infoCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.utility.divider,
  },

  // Member Card
  memberCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
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
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  newsImage: {
    borderTopLeftRadius: borderRadius.md,
    borderTopRightRadius: borderRadius.md,
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
