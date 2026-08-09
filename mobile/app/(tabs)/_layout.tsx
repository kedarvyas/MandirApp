import { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { GradientBackdrop, GlassTabBar, NotificationPrompt } from '../../src/components';
import { supabase } from '../../src/lib/supabase';

/**
 * Family and Settings used to be `href: null` and reachable only through a
 * drawer that slid down from the top. They are real destinations, so they are
 * real tabs now and the drawer is gone.
 *
 * The tab bar floats over the content instead of reserving space below it --
 * screens pad themselves with `useTabBarInset()`.
 */
export default function TabsLayout() {
  const [memberId, setMemberId] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function fetchMemberId() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.phone) {
        const { data } = await supabase
          .from('members')
          .select('id')
          .eq('phone', user.phone)
          .maybeSingle();
        if (data) {
          setMemberId(data.id);
        }
      }
    }
    fetchMemberId();
  }, []);

  return (
    <View style={styles.container}>
      {/* The depth layer the glass refracts. Spans every tab so it stays put
          as you switch between them. */}
      <GradientBackdrop />

      <Tabs
        tabBar={(props) => <GlassTabBar {...props} />}
        screenOptions={{
          headerShown: false, // Each screen renders its own GlassHeader.
          // Transparent scenes let the shared backdrop show through.
          sceneStyle: styles.scene,
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Pass' }} />
        <Tabs.Screen name="news" options={{ title: 'News' }} />
        <Tabs.Screen name="family" options={{ title: 'Family' }} />
        <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
      </Tabs>

      {/* Notification permission prompt (shows once on first launch) */}
      <NotificationPrompt memberId={memberId} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scene: {
    backgroundColor: 'transparent',
  },
});
