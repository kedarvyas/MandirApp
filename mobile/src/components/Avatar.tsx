import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, ImageStyle, ViewStyle } from 'react-native';
import { colors, typography } from '../constants/theme';

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
  const [imageError, setImageError] = useState(false);
  const dimension = sizeMap[size];
  const fontSize = fontSizeMap[size];

  // Show image if source exists and hasn't errored
  if (source && !imageError) {
    return (
      <Image
        source={{ uri: source }}
        style={[
          styles.image,
          {
            width: dimension,
            height: dimension,
            borderRadius: dimension / 2,
          },
          style as ImageStyle,
        ]}
        onError={() => {
          setImageError(true);
        }}
      />
    );
  }

  // Fallback to initials
  return (
    <View
      style={[
        styles.placeholder,
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
        },
        style,
      ]}
    >
      <Text style={[styles.initials, { fontSize }]}>
        {getInitials(name) || '?'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.background.tertiary,
  },
  placeholder: {
    backgroundColor: colors.primary.plum,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.text.inverse,
    fontWeight: typography.weight.semibold,
  },
});

export default Avatar;
