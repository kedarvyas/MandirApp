import React from 'react';
import { ViewStyle } from 'react-native';
import { borderRadius } from '../constants/theme';
import { GlassSurface } from './GlassSurface';

/**
 * The general-purpose surface.
 *
 * Card keeps its original API so existing screens did not have to change, but
 * it is now a glass panel rather than an opaque cream rectangle. Reach for
 * `GlassSurface` directly when you need to control blur, sheen, or radius.
 */

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
    <GlassSurface
      variant={variant === 'outlined' ? 'surface' : 'strong'}
      padding={padding}
      radius={borderRadius.xl}
      elevation={
        variant === 'elevated' ? 'md' : variant === 'outlined' ? 'none' : 'sm'
      }
      style={style}
    >
      {children}
    </GlassSurface>
  );
}

export default Card;
