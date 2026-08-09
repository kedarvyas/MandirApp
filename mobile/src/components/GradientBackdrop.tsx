import React from 'react';
import { StyleSheet, useWindowDimensions, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';
import { useTheme } from '../lib/themeContext';

/**
 * The depth layer every glass surface sits on.
 *
 * Blur only reads as a material when there is something behind it worth
 * refracting -- on a flat, single-colour background a BlurView is invisible.
 * This paints a base wash plus three soft colour blobs so the glass picks up a
 * gradient as it moves over the screen.
 *
 * It is purely decorative: it fills its parent, ignores touches, and renders
 * behind everything else.
 */

/** Blob geometry as fractions of the screen, so it scales across devices. */
const BLOBS = [
  { cx: 0.14, cy: 0.06, rx: 0.85, ry: 0.40 },
  { cx: 0.98, cy: 0.34, rx: 0.70, ry: 0.32 },
  { cx: 0.32, cy: 0.95, rx: 0.95, ry: 0.42 },
] as const;

interface GradientBackdropProps {
  style?: ViewStyle;
}

export function GradientBackdrop({ style }: GradientBackdropProps) {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, style]}
      // The backdrop is decoration; screen readers should walk straight past it.
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <LinearGradient
        colors={[theme.backdrop.base[0], theme.backdrop.base[1]]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          {theme.backdrop.blobs.map((color, index) => (
            <RadialGradient
              key={`grad-${index}`}
              id={`blob-${index}`}
              cx="50%"
              cy="50%"
              rx="50%"
              ry="50%"
            >
              <Stop offset="0" stopColor={color} stopOpacity={1} />
              <Stop offset="0.55" stopColor={color} stopOpacity={0.55} />
              <Stop offset="1" stopColor={color} stopOpacity={0} />
            </RadialGradient>
          ))}
        </Defs>

        {BLOBS.map((blob, index) => (
          <Ellipse
            key={`blob-${index}`}
            cx={blob.cx * width}
            cy={blob.cy * height}
            rx={blob.rx * width}
            ry={blob.ry * height}
            fill={`url(#blob-${index})`}
          />
        ))}
      </Svg>
    </View>
  );
}

export default GradientBackdrop;
