import React from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { borderRadius as radii, spacing } from '../constants/theme';
import { useTheme } from '../lib/themeContext';

/**
 * A translucent glass panel: blur, a tint so it reads as a material rather
 * than a smear, a specular sheen across the top edge, and a hairline rim.
 *
 * Layering, outside in:
 *   1. shadow wrapper  -- must not clip, or the shadow disappears
 *   2. clip            -- rounds the corners and carries the rim
 *   3. blur + tint     -- the material itself
 *   4. sheen           -- the light catching the top edge
 *   5. content
 *
 * Android falls back to an opaque tint. expo-blur's Android backend is
 * experimental and expensive to composite; the solid fill keeps the same
 * shape and hierarchy without the frame drops.
 */

const CAN_BLUR = Platform.OS === 'ios';

type Elevation = 'none' | 'sm' | 'md' | 'lg' | 'pass';
type Variant = 'surface' | 'strong';
type Padding = 'none' | 'sm' | 'md' | 'lg';

const PADDING: Record<Padding, number> = {
  none: 0,
  sm: spacing.sm,
  md: spacing.md,
  lg: spacing.lg,
};

interface GlassSurfaceProps {
  children?: React.ReactNode;
  /** `strong` is more opaque -- use it behind dense or small text. */
  variant?: Variant;
  padding?: Padding;
  radius?: number;
  elevation?: Elevation;
  /** Blur strength override. Defaults to the theme's resting intensity. */
  intensity?: number;
  /** The top-edge sheen. Turn it off for full-bleed chrome like the tab bar. */
  sheen?: boolean;
  /** Drop the hairline rim. */
  borderless?: boolean;
  /** Positioning and sizing -- applied to the outer (shadow) wrapper. */
  style?: ViewStyle;
  /** Applied to the inner content view, alongside `padding`. */
  contentStyle?: ViewStyle;
}

export function GlassSurface({
  children,
  variant = 'surface',
  padding = 'md',
  radius = radii.xl,
  elevation = 'md',
  intensity,
  sheen = true,
  borderless = false,
  style,
  contentStyle,
}: GlassSurfaceProps) {
  const theme = useTheme();

  const fill =
    variant === 'strong' ? theme.glass.surfaceStrong : theme.glass.surface;
  const blurIntensity = intensity ?? theme.glass.intensity;

  return (
    <View
      style={[elevation !== 'none' && theme.shadows[elevation], style]}
    >
      <View
        style={[
          styles.clip,
          {
            borderRadius: radius,
            borderWidth: borderless ? 0 : 1,
            borderColor: borderless ? 'transparent' : theme.glass.border,
          },
        ]}
      >
        {CAN_BLUR ? (
          <BlurView
            intensity={blurIntensity}
            tint={theme.glass.tint}
            style={StyleSheet.absoluteFill}
          />
        ) : null}

        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: CAN_BLUR ? fill : theme.glass.fallback },
          ]}
        />

        {sheen ? (
          <LinearGradient
            pointerEvents="none"
            colors={[theme.glass.highlight[0], theme.glass.highlight[1]]}
            style={[styles.sheen, { borderTopLeftRadius: radius, borderTopRightRadius: radius }]}
          />
        ) : null}

        <View style={[{ padding: PADDING[padding] }, contentStyle]}>
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 72,
  },
});

export default GlassSurface;
