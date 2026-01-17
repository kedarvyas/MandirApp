# UI/UX Design Expert

Professional design guidance for mobile and web interfaces.

## Design System Principles

### Atomic Design Methodology

**Atoms** - Basic building blocks
- Colors, typography, icons, spacing
- Buttons, inputs, labels

**Molecules** - Simple component groups
- Form fields (label + input + error)
- Card headers (avatar + name + action)

**Organisms** - Complex UI sections
- Navigation bars
- Member cards
- Check-in modals

**Templates** - Page layouts
- Screen structures without real content

**Pages** - Final implementations
- Templates with actual data

## Sanctum Design Tokens

### Colors
```typescript
const colors = {
  // Primary palette
  primary: '#4A2040',      // Maroon - main brand
  secondary: '#6B3050',    // Plum - hover/active states

  // Backgrounds
  background: '#FDF8F5',   // Warm white
  card: '#F5E6DC',         // Cream
  surface: '#FFFFFF',      // Pure white for inputs

  // Text
  textPrimary: '#2D1A24',  // Dark maroon
  textSecondary: '#6B5A63', // Muted
  textInverse: '#FFFFFF',  // On dark backgrounds

  // Semantic
  success: '#4A7C59',      // Green
  warning: '#D4A03E',      // Amber
  error: '#C45B4A',        // Red
  accent: '#D4A89A',       // Rose
};
```

### Typography
```typescript
const typography = {
  // Font families
  heading: 'System',       // SF Pro / Roboto
  body: 'System',

  // Sizes (mobile)
  h1: 28,
  h2: 24,
  h3: 20,
  body: 16,
  caption: 14,
  small: 12,

  // Weights
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};
```

### Spacing Scale
```typescript
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
```

### Border Radius
```typescript
const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,  // Pills, avatars
};
```

## Component Patterns

### Buttons
```typescript
// Primary - main actions
<Button variant="primary">Check In</Button>

// Secondary - alternative actions
<Button variant="secondary">View History</Button>

// Ghost - subtle actions
<Button variant="ghost">Cancel</Button>

// Destructive - dangerous actions
<Button variant="destructive">Delete</Button>
```

### Cards
```typescript
// Standard card
<Card>
  <CardHeader>
    <Avatar />
    <Title />
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
  <CardFooter>
    <Action />
  </CardFooter>
</Card>
```

### Forms
- Labels above inputs (not floating)
- Clear error states with red border + message
- Success states with green checkmark
- Disabled states at 50% opacity

### Lists
- Use FlashList for performance
- Include pull-to-refresh
- Show empty state with illustration
- Skeleton loaders during fetch

## Accessibility Guidelines

### Touch Targets
- Minimum 44x44pt for interactive elements
- Add padding to small icons

### Color Contrast
- Text on primary: use white (#FFFFFF)
- Text on background: use textPrimary (#2D1A24)
- Minimum 4.5:1 contrast ratio

### Screen Readers
```typescript
// Accessible button
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel="Check in to temple"
  accessibilityHint="Double tap to record your attendance"
>
```

### Motion
- Respect `reduceMotion` preference
- Keep animations under 300ms
- Avoid flashing or strobing

## Mobile-Specific Patterns

### Navigation
- Bottom tabs for main sections (max 5)
- Stack navigation for detail screens
- Swipe gestures for back navigation

### Gestures
- Swipe to delete/archive
- Pull to refresh
- Long press for context menu

### Feedback
- Haptic feedback on important actions
- Visual feedback on all touches
- Loading states for async operations

### Safe Areas
- Respect notch/dynamic island
- Account for home indicator
- Handle keyboard avoidance

## Layout Principles

### Mobile First
1. Design for smallest screen first
2. Scale up for tablets
3. Use responsive spacing

### Visual Hierarchy
1. Size: Larger = more important
2. Color: Primary color draws attention
3. Space: More whitespace = more focus
4. Position: Top-left scans first

### Consistency
- Same patterns for same actions
- Predictable placement of elements
- Uniform spacing throughout

## Review Checklist

When reviewing UI/UX:
- [ ] Colors match design tokens
- [ ] Typography follows scale
- [ ] Spacing is consistent
- [ ] Touch targets are adequate
- [ ] Loading/error/empty states exist
- [ ] Accessibility labels present
- [ ] Animations are subtle
- [ ] Layout handles edge cases

## Anti-Patterns to Avoid

- Text over images without overlay
- Tiny tap targets
- Missing loading states
- Inconsistent icon styles
- Too many colors
- Walls of text
- Hiding essential actions in menus
- Ignoring platform conventions
