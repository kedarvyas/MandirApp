import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/lib/authContext';
import { useTheme } from '../src/lib/themeContext';
import { getStoredOrganization } from '../src/lib/orgContext';

/**
 * Cold-start entry point. Decides where the app opens and renders nothing of
 * its own; the signed-out UI lives at "/welcome" so that it has a path the
 * (tabs) group cannot shadow.
 */
export default function IndexScreen() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    if (loading) return;

    if (!session) {
      router.replace('/welcome');
      return;
    }

    let active = true;
    getStoredOrganization().then((org) => {
      if (!active) return;
      router.replace(org ? '/(tabs)' : '/(auth)/org-code');
    });

    return () => {
      active = false;
    };
  }, [session, loading, router]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background.primary },
      ]}
    >
      <ActivityIndicator size="large" color={theme.colors.primary.maroon} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
