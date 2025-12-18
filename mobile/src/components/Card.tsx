import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  style,
}: CardProps) {
  return (
    <View
      style={[
        styles.base,
        styles[variant],
        padding !== 'none' && styles[`${padding}Padding`],
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
  },

  // Variants
  default: {
    ...shadows.sm,
  },
  elevated: {
    ...shadows.md,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.accent.rose,
    shadowOpacity: 0,
    elevation: 0,
  },

  // Padding
  smPadding: {
    padding: spacing.sm,
  },
  mdPadding: {
    padding: spacing.md,
  },
  lgPadding: {
    padding: spacing.lg,
  },
});

export default Card;
