import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../src/constants/theme';
import { AuthProvider, useAuth } from '../src/lib/authContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

function RootNavigator() {
  const { session, loading } = useAuth();
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.maroon} />
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.primary.maroon,
          },
          headerTintColor: colors.text.inverse,
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: colors.background.primary,
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="welcome"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="edit-profile"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="add-family-member"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="organizations"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
});
