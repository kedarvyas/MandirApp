import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, ImageStyle, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme, typography } from '../constants/theme';
import { useTheme, useThemedStyles } from '../lib/themeContext';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  source?: string | null;
  name?: string;
  size?: AvatarSize;
  style?: ImageStyle | ViewStyle;
}

const sizeMap: Record<AvatarSize, number> = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
};

const fontSizeMap: Record<AvatarSize, number> = {
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
};

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function Avatar({ source, name = '', size = 'md', style }: AvatarProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const [imageError, setImageError] = useState(false);
  const dimension = sizeMap[size];
  const fontSize = fontSizeMap[size];

  const shape = {
    width: dimension,
    height: dimension,
    borderRadius: dimension / 2,
  };

  // Show image if source exists and hasn't errored
  if (source && !imageError) {
    return (
      <Image
        source={{ uri: source }}
        style={[styles.image, shape, style as ImageStyle]}
        onError={() => {
          setImageError(true);
        }}
      />
    );
  }

  // Fallback to initials on a plum gradient
  return (
    <View style={[styles.placeholder, shape, style]}>
      <LinearGradient
        colors={[theme.colors.primary.plum, theme.colors.primary.maroon]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: dimension / 2 }]}
      />
      <Text style={[styles.initials, { fontSize }]}>
        {getInitials(name) || '?'}
      </Text>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    image: {
      backgroundColor: theme.colors.background.tertiary,
      borderWidth: 1,
      borderColor: theme.glass.border,
    },
    placeholder: {
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.glass.border,
    },
    initials: {
      color: theme.colors.text.onImmersive,
      fontWeight: typography.weight.semibold,
    },
  });

export default Avatar;
