import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from '../src/lib/authContext';
import { ThemeProvider, useTheme, useThemeContext } from '../src/lib/themeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}

function RootNavigator() {
  const { session, loading } = useAuth();
  const { isDark } = useThemeContext();
  const theme = useTheme();
  const router = useRouter();
  const segments = useSegments();

  // Losing the session must always land on the welcome screen. Screens do not
  // navigate on sign-out themselves: two navigations racing each other is what
  // previously left the signed-out user sitting on the home tab.
  // The welcome screen and the (auth) flow legitimately run without a session.
  useEffect(() => {
    // Routes that are legitimately reachable without a session. "index" is the
    // cold-start router and "welcome" is the signed-out landing screen.
    // Redirect to "/welcome", never "/": "(tabs)" is a group and adds no path
    // segment, so app/(tabs)/index.tsx also answers to "/" and would win from
    // inside the tabs, leaving a signed-out user on the member home screen.
    if (loading) return;
    const group = segments[0] as string | undefined;
    const isPublic =
      group === undefined || group === '(auth)' || group === 'welcome';
    if (!session && !isPublic) {
      router.replace('/welcome');
    }
  }, [session, loading, segments, router]);

  // The status bar follows the resolved appearance, not the system one -- a
  // member who overrides the theme should get matching bar contents.
  const statusBar = <StatusBar style={isDark ? 'light' : 'dark'} />;

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background.primary },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary.maroon} />
        {statusBar}
      </View>
    );
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: theme.colors.background.primary,
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="edit-profile" />
        <Stack.Screen name="add-family-member" />
        <Stack.Screen name="organizations" />
      </Stack>
      {statusBar}
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
