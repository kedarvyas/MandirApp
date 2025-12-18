import { Stack } from 'expo-router';
import { colors } from '../../src/constants/theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background.primary,
        },
        headerTintColor: colors.primary.maroon,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: colors.background.primary,
        },
      }}
    >
      <Stack.Screen
        name="phone"
        options={{
          title: 'Sign In',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="verify"
        options={{
          title: 'Verify Phone',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="profile-setup"
        options={{
          title: 'Complete Profile',
          headerBackVisible: false,
        }}
      />
    </Stack>
  );
}
