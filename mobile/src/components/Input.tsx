import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import {
  borderRadius,
  spacing,
  Theme,
  typography,
} from '../constants/theme';
import { useTheme, useThemedStyles } from '../lib/themeContext';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  hint,
  containerStyle,
  style,
  ...props
}: InputProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={theme.colors.text.tertiary}
        // Keeps the caret and the keyboard matched to the appearance.
        selectionColor={theme.colors.primary.maroon}
        keyboardAppearance={theme.scheme}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      marginBottom: spacing.md,
    },
    label: {
      fontSize: typography.size.sm,
      fontWeight: typography.weight.medium,
      color: theme.colors.text.secondary,
      marginBottom: spacing.xs + 2,
      marginLeft: spacing.xs,
    },
    input: {
      backgroundColor: theme.glass.surfaceStrong,
      borderWidth: 1,
      borderColor: theme.colors.utility.divider,
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 5,
      fontSize: typography.size.md,
      color: theme.colors.text.primary,
      minHeight: 50,
    },
    inputFocused: {
      borderColor: theme.colors.primary.maroon,
      // Border width stays at 1 so the field does not shift on focus.
      backgroundColor: theme.glass.surfaceStrong,
    },
    inputError: {
      borderColor: theme.colors.semantic.error,
    },
    error: {
      fontSize: typography.size.xs,
      color: theme.colors.semantic.error,
      marginTop: spacing.xs,
      marginLeft: spacing.xs,
    },
    hint: {
      fontSize: typography.size.xs,
      color: theme.colors.text.tertiary,
      marginTop: spacing.xs,
      marginLeft: spacing.xs,
    },
  });

export default Input;
