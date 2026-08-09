import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  borderRadius,
  motion,
  spacing,
  Theme,
  typography,
} from '../constants/theme';
import { useTheme, useThemedStyles } from '../lib/themeContext';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  haptic?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  haptic = true,
  style,
  textStyle,
}: ButtonProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const isDisabled = disabled || loading;

  // A small dip on press. Scale is a transform, so it stays on the UI thread.
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) => {
    Animated.spring(scale, {
      toValue: value,
      ...motion.spring.lively,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const spinnerColor =
    variant === 'primary' || variant === 'danger'
      ? theme.colors.text.inverse
      : theme.colors.primary.maroon;

  return (
    <Animated.View
      style={[
        fullWidth && styles.fullWidth,
        { transform: [{ scale }] },
        style,
      ]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={() => animateTo(0.97)}
        onPressOut={() => animateTo(1)}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        style={({ pressed }) => [
          styles.base,
          styles[variant],
          styles[`${size}Size`],
          pressed && !isDisabled && styles.pressed,
          isDisabled && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={spinnerColor} size="small" />
        ) : (
          <Text
            style={[
              styles.text,
              styles[`${variant}Text`],
              styles[`${size}Text`],
              isDisabled && styles.disabledText,
              textStyle,
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    base: {
      alignItems: 'center',
      justifyContent: 'center',
      // Pill corners throughout -- the old 8pt radius was the most dated
      // detail in the app.
      borderRadius: borderRadius.full,
    },

    // Variants
    primary: {
      backgroundColor: theme.colors.primary.maroon,
      ...theme.shadows.sm,
    },
    secondary: {
      backgroundColor: theme.glass.surface,
      borderWidth: 1,
      borderColor: theme.colors.primary.maroon,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    danger: {
      backgroundColor: theme.colors.semantic.error,
      ...theme.shadows.sm,
    },

    // Sizes
    smSize: {
      paddingVertical: spacing.xs + 2,
      paddingHorizontal: spacing.md,
      minHeight: 36,
    },
    mdSize: {
      paddingVertical: spacing.sm + 4,
      paddingHorizontal: spacing.lg,
      minHeight: 48,
    },
    lgSize: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      minHeight: 54,
    },

    // States
    fullWidth: {
      width: '100%',
    },
    pressed: {
      opacity: 0.9,
    },
    disabled: {
      opacity: 0.45,
    },

    // Text base
    text: {
      fontWeight: typography.weight.semibold,
      letterSpacing: 0.2,
    },

    // Text variants
    primaryText: {
      color: theme.colors.text.inverse,
    },
    secondaryText: {
      color: theme.colors.primary.maroon,
    },
    ghostText: {
      color: theme.colors.primary.maroon,
    },
    dangerText: {
      color: theme.colors.text.inverse,
    },

    // Text sizes
    smText: {
      fontSize: typography.size.sm,
    },
    mdText: {
      fontSize: typography.size.md,
    },
    lgText: {
      fontSize: typography.size.lg,
    },

    disabledText: {
      opacity: 0.7,
    },
  });

export default Button;
