/**
 * Sanctum Design System
 *
 * This file contains all design tokens used throughout the app.
 * Import from here to ensure consistency.
 *
 * There are two palettes -- light and a warm dark maroon -- exposed as
 * `lightTheme` and `darkTheme`. Screens should read the active one through
 * `useTheme()` (see src/lib/themeContext.tsx) rather than importing a palette
 * directly. The bare `colors` / `shadows` exports are the light palette and
 * exist so that anything not yet migrated keeps rendering.
 *
 * Scheme-independent tokens (typography, spacing, radius, motion) are plain
 * exports -- they do not change between appearances.
 */

// ---------------------------------------------------------------------------
// Scheme-independent tokens
// ---------------------------------------------------------------------------

export const typography = {
  // Font sizes
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 40,
  },

  // Font weights
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
} as const;

/**
 * Shared motion values. Durations are milliseconds; springs are configs for
 * the `Animated` API (react-native-reanimated is not installed).
 */
export const motion = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
  spring: {
    // Settles quickly with almost no overshoot -- for surfaces sliding in.
    gentle: { tension: 65, friction: 11 },
    // A little bounce -- for press feedback and badges.
    lively: { tension: 120, friction: 9 },
  },
} as const;

/** Height of the floating glass tab bar, excluding the safe-area inset. */
export const TAB_BAR_HEIGHT = 62;

// ---------------------------------------------------------------------------
// Palette shape
// ---------------------------------------------------------------------------

export interface ThemeColors {
  primary: {
    /** The main brand/interactive colour. Lifted to an orchid rose in dark. */
    maroon: string;
    plum: string;
    maroonLight: string;
    /** Always the true brand maroon, regardless of scheme. For the wordmark,
     *  splash, and anything that must not shift with appearance. */
    brand: string;
  };
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    /** The deep, saturated field the hero/pass sits on. */
    immersive: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    /** Text on a dark/brand-filled surface. */
    inverse: string;
    /** Text on top of the immersive hero. */
    onImmersive: string;
  };
  accent: {
    rose: string;
    roseLight: string;
  };
  semantic: {
    success: string;
    successLight: string;
    warning: string;
    warningLight: string;
    error: string;
    errorLight: string;
    info: string;
    infoLight: string;
  };
  utility: {
    white: string;
    black: string;
    transparent: string;
    overlay: string;
    divider: string;
  };
}

export interface ThemeGlass {
  /** Passed straight to expo-blur's BlurView. */
  tint: 'light' | 'dark';
  /** Blur strength for a resting card surface. */
  intensity: number;
  /** Stronger blur for chrome that content scrolls beneath. */
  chromeIntensity: number;
  /** Tint laid over the blur so the surface reads as a material, not a smear. */
  surface: string;
  /** A more opaque variant for surfaces that carry dense text. */
  surfaceStrong: string;
  /** Hairline edge that catches the light. */
  border: string;
  /** Two-stop gradient for the specular sheen across the top of a surface. */
  highlight: readonly [string, string];
  /** Solid stand-in used where blur is unavailable or too costly (Android). */
  fallback: string;
  /** Scrim behind modal sheets. */
  scrim: string;
}

/** Colours for the aurora depth layer that gives the blur something to refract. */
export interface ThemeBackdrop {
  /** Base wash, painted bottom-to-top behind everything. */
  base: readonly [string, string];
  /** Soft colour blobs floating over the base. */
  blobs: readonly [string, string, string];
  /** The deep gradient behind the home hero, top to bottom. */
  hero: readonly [string, string];
}

export interface ThemeShadow {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export interface Theme {
  scheme: 'light' | 'dark';
  colors: ThemeColors;
  glass: ThemeGlass;
  backdrop: ThemeBackdrop;
  shadows: {
    sm: ThemeShadow;
    md: ThemeShadow;
    lg: ThemeShadow;
    /** For the hero pass -- deep and soft, so the card reads as lifted. */
    pass: ThemeShadow;
  };
}

// ---------------------------------------------------------------------------
// Light
// ---------------------------------------------------------------------------

const lightColors: ThemeColors = {
  primary: {
    maroon: '#4A2040',
    plum: '#6B3050',
    maroonLight: '#5D2850',
    brand: '#4A2040',
  },

  background: {
    primary: '#FDF8F5', // Main app background (off-white)
    secondary: '#F5E6DC', // Card backgrounds (cream)
    tertiary: '#EDD9CC', // Slightly darker cream
    immersive: '#4A2040',
  },

  text: {
    primary: '#2D1A24',
    secondary: '#5C4350',
    tertiary: '#8B7080',
    inverse: '#FFFFFF',
    onImmersive: '#FFFFFF',
  },

  accent: {
    rose: '#D4A89A',
    roseLight: '#E8C4B8',
  },

  semantic: {
    success: '#4A7C59',
    successLight: '#E8F5E9',
    warning: '#D4A03E',
    warningLight: '#FFF8E1',
    error: '#C45B4A',
    errorLight: '#FFEBEE',
    info: '#5B7C9A',
    infoLight: '#E3F2FD',
  },

  utility: {
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
    overlay: 'rgba(45, 26, 36, 0.5)',
    divider: '#E8DDD5',
  },
};

export const lightTheme: Theme = {
  scheme: 'light',
  colors: lightColors,
  glass: {
    tint: 'light',
    intensity: 40,
    chromeIntensity: 60,
    surface: 'rgba(255, 253, 251, 0.62)',
    surfaceStrong: 'rgba(255, 253, 251, 0.82)',
    border: 'rgba(255, 255, 255, 0.85)',
    highlight: ['rgba(255, 255, 255, 0.75)', 'rgba(255, 255, 255, 0)'],
    fallback: 'rgba(253, 245, 240, 0.94)',
    scrim: 'rgba(45, 26, 36, 0.35)',
  },
  backdrop: {
    base: ['#FDF8F5', '#F6E9E2'],
    blobs: [
      'rgba(212, 168, 154, 0.55)', // rose
      'rgba(107, 48, 80, 0.20)', // plum
      'rgba(232, 196, 184, 0.60)', // light rose
    ],
    hero: ['#4A2040', '#7A3A5C'],
  },
  shadows: {
    sm: {
      shadowColor: lightColors.text.primary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: lightColors.text.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: lightColors.text.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
    pass: {
      shadowColor: '#2D1A24',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.22,
      shadowRadius: 28,
      elevation: 16,
    },
  },
};

// ---------------------------------------------------------------------------
// Dark (warm maroon, not neutral grey)
// ---------------------------------------------------------------------------

const darkColors: ThemeColors = {
  primary: {
    // The brand maroon is unreadable as an accent on a dark field, so the
    // interactive colour lifts to an orchid rose derived from the plum.
    maroon: '#D2A0B9',
    plum: '#B87F9E',
    maroonLight: '#E3BDD0',
    brand: '#4A2040',
  },

  background: {
    primary: '#16090F',
    secondary: '#241420',
    tertiary: '#33202C',
    immersive: '#2A1024',
  },

  text: {
    primary: '#F7ECEF',
    secondary: '#C9B2BE',
    tertiary: '#91798A',
    // "Inverse" means on-brand-fill: the dark accents are light, so this flips.
    inverse: '#1A0D14',
    onImmersive: '#FFFFFF',
  },

  accent: {
    rose: '#D4A89A',
    roseLight: '#E8C4B8',
  },

  semantic: {
    success: '#7DBF92',
    successLight: 'rgba(125, 191, 146, 0.16)',
    warning: '#E8C06A',
    warningLight: 'rgba(232, 192, 106, 0.16)',
    error: '#E88B7A',
    errorLight: 'rgba(232, 139, 122, 0.16)',
    info: '#8FB3D0',
    infoLight: 'rgba(143, 179, 208, 0.16)',
  },

  utility: {
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
    overlay: 'rgba(0, 0, 0, 0.6)',
    divider: 'rgba(255, 255, 255, 0.10)',
  },
};

export const darkTheme: Theme = {
  scheme: 'dark',
  colors: darkColors,
  glass: {
    tint: 'dark',
    intensity: 45,
    chromeIntensity: 70,
    surface: 'rgba(58, 34, 50, 0.55)',
    surfaceStrong: 'rgba(48, 28, 42, 0.78)',
    border: 'rgba(255, 255, 255, 0.16)',
    highlight: ['rgba(255, 255, 255, 0.18)', 'rgba(255, 255, 255, 0)'],
    fallback: 'rgba(40, 23, 35, 0.96)',
    scrim: 'rgba(0, 0, 0, 0.55)',
  },
  backdrop: {
    base: ['#16090F', '#220F1C'],
    blobs: [
      'rgba(150, 62, 108, 0.42)', // plum glow
      'rgba(212, 168, 154, 0.16)', // warm rose
      'rgba(90, 40, 90, 0.38)', // violet
    ],
    hero: ['#2A1024', '#4A1D3C'],
  },
  shadows: {
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.35,
      shadowRadius: 3,
      elevation: 2,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.45,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.55,
      shadowRadius: 16,
      elevation: 8,
    },
    pass: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 14 },
      shadowOpacity: 0.65,
      shadowRadius: 32,
      elevation: 16,
    },
  },
};

// ---------------------------------------------------------------------------
// Back-compatible light-palette exports
// ---------------------------------------------------------------------------

/** @deprecated Prefer `useTheme().colors` so the value follows the appearance. */
export const colors = lightTheme.colors;

/** @deprecated Prefer `useTheme().shadows`. */
export const shadows = lightTheme.shadows;
