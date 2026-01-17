import { useState, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, typography } from '../../src/constants/theme';
import { AppHeader, DrawerMenu, NotificationPrompt } from '../../src/components';
import { supabase } from '../../src/lib/supabase';

// Clean icon component using Feather icons
function TabIcon({ name, focused }: { name: 'home' | 'bell'; focused: boolean }) {
  return (
    <View style={styles.iconContainer}>
      <Feather
        name={name}
        size={24}
        color={focused ? colors.primary.maroon : colors.text.tertiary}
      />
    </View>
  );
}

export default function TabsLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
      {/* Custom Header */}
      <AppHeader onMenuPress={() => setIsMenuOpen(true)} />

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <Tabs
          screenOptions={{
            headerShown: false, // Hide default header, using custom AppHeader
            tabBarStyle: {
              backgroundColor: colors.background.primary,
              borderTopColor: colors.utility.divider,
              height: 85,
              paddingBottom: 25,
              paddingTop: 10,
            },
            tabBarActiveTintColor: colors.primary.maroon,
            tabBarInactiveTintColor: colors.text.tertiary,
            tabBarLabelStyle: {
              fontSize: typography.size.xs,
              fontWeight: '500',
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
            }}
          />
          <Tabs.Screen
            name="news"
            options={{
              title: 'News',
              tabBarIcon: ({ focused }) => <TabIcon name="bell" focused={focused} />,
            }}
          />
          {/* Family and Settings are now in the drawer menu, hide from tab bar */}
          <Tabs.Screen
            name="family"
            options={{
              href: null, // Hide from tab bar
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              href: null, // Hide from tab bar
            }}
          />
        </Tabs>
      </View>

      {/* Drawer Menu */}
      <DrawerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Notification Permission Prompt (shows once on first launch) */}
      <NotificationPrompt memberId={memberId} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  tabsContainer: {
    flex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
