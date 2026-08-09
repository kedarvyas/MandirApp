import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkTheme, lightTheme, Theme } from '../constants/theme';

/**
 * Appearance handling.
 *
 * The app follows the system appearance by default. `useColorScheme()` only
 * reports the real system value when app.json sets
 * `"userInterfaceStyle": "automatic"` -- pinning it to "light" makes the hook
 * return "light" forever, so the two must stay in sync.
 *
 * app.json is deliberately still pinned to "light" today. It is native config,
 * and `runtimeVersion.policy` is "fingerprint", so flipping it to "automatic"
 * changes the runtime version and cuts every installed build off from OTA
 * updates. Flip it in the same change as the next native build and the
 * "System" option starts following the device with no code change here.
 *
 * Until then "System" resolves to light, and a member reaches the dark theme by
 * choosing it explicitly. The choice is persisted so it survives a relaunch.
 */

export type ThemePreference = 'system' | 'light' | 'dark';

const PREFERENCE_KEY = '@sanctum/theme_preference';

interface ThemeContextValue {
  theme: Theme;
  /** What the member picked -- 'system' means "whatever iOS/Android says". */
  preference: ThemePreference;
  setPreference: (next: ThemePreference) => void;
  /** Convenience for the many `scheme === 'dark'` checks in styling code. */
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemePreference(value: string | null): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  // Load the stored override. Until it resolves we render with the system
  // appearance, which is the right answer for everyone who never set one.
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(PREFERENCE_KEY)
      .then((stored) => {
        if (!cancelled && isThemePreference(stored)) {
          setPreferenceState(stored);
        }
      })
      .catch(() => {
        // A missing or unreadable preference just means "follow the system".
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    AsyncStorage.setItem(PREFERENCE_KEY, next).catch(() => {
      // Persisting is best-effort; the choice still applies for this session.
    });
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const resolved =
      preference === 'system' ? (systemScheme ?? 'light') : preference;
    const isDark = resolved === 'dark';
    return {
      theme: isDark ? darkTheme : lightTheme,
      preference,
      setPreference,
      isDark,
    };
  }, [preference, systemScheme, setPreference]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used inside a ThemeProvider');
  }
  return context;
}

/** The active theme. This is what styling code wants almost every time. */
export function useTheme(): Theme {
  return useThemeContext().theme;
}

/**
 * Builds a StyleSheet from the active theme and rebuilds it only when the
 * appearance changes.
 *
 *   const styles = useThemedStyles(createStyles);
 *   const createStyles = (t: Theme) => StyleSheet.create({ ... });
 *
 * `createStyles` must be defined at module scope so its identity is stable.
 */
export function useThemedStyles<T>(createStyles: (theme: Theme) => T): T {
  const theme = useTheme();
  return useMemo(() => createStyles(theme), [createStyles, theme]);
}
