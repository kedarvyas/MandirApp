/**
 * Sanctum Design System
 *
 * This file contains all design tokens used throughout the app.
 * Import from here to ensure consistency.
 */

export const colors = {
  // Primary brand colors
  primary: {
    maroon: '#4A2040',
    plum: '#6B3050',
    maroonLight: '#5D2850',
  },

  // Background colors
  background: {
    primary: '#FDF8F5',    // Main app background (off-white)
    secondary: '#F5E6DC',  // Card backgrounds (cream)
    tertiary: '#EDD9CC',   // Slightly darker cream
  },

  // Text colors
  text: {
    primary: '#2D1A24',    // Main text (dark)
    secondary: '#5C4350',  // Secondary text
    tertiary: '#8B7080',   // Muted text
    inverse: '#FFFFFF',    // Text on dark backgrounds
  },

  // Accent colors
  accent: {
    rose: '#D4A89A',       // Soft rose for borders, highlights
    roseLight: '#E8C4B8',  // Lighter rose
  },

  // Semantic colors
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

  // Utility colors
  utility: {
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
    overlay: 'rgba(45, 26, 36, 0.5)',
    divider: '#E8DDD5',
  },
} as const;

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
  full: 9999,
} as const;

export const shadows = {
  sm: {
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;

// Common component styles
export const componentStyles = {
  // Screen container
  screen: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  // Screen with padding
  screenPadded: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },

  // Card styles
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...shadows.sm,
  },

  // Input styles
  input: {
    backgroundColor: colors.utility.white,
    borderWidth: 1,
    borderColor: colors.accent.rose,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: typography.size.md,
    color: colors.text.primary,
  },

  // Primary button
  buttonPrimary: {
    backgroundColor: colors.primary.maroon,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  buttonPrimaryText: {
    color: colors.text.inverse,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },

  // Secondary button
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary.maroon,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  buttonSecondaryText: {
    color: colors.primary.maroon,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
} as const;

// Semantic text styles
export const textStyles = {
  // Headings
  h1: {
    fontSize: typography.size.xxxl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    lineHeight: typography.size.xxxl * typography.lineHeight.tight,
  },
  h2: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    lineHeight: typography.size.xxl * typography.lineHeight.tight,
  },
  h3: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    lineHeight: typography.size.xl * typography.lineHeight.normal,
  },

  // Body text
  body: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.regular,
    color: colors.text.primary,
    lineHeight: typography.size.md * typography.lineHeight.normal,
  },
  bodySmall: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.regular,
    color: colors.text.secondary,
    lineHeight: typography.size.sm * typography.lineHeight.normal,
  },

  // Utility text
  caption: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.regular,
    color: colors.text.tertiary,
    lineHeight: typography.size.xs * typography.lineHeight.normal,
  },
  label: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.text.secondary,
    lineHeight: typography.size.sm * typography.lineHeight.normal,
  },
} as const;

// Export everything as a theme object for convenience
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  componentStyles,
  textStyles,
} as const;

export default theme;
