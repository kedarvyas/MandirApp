import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { GradientBackdrop } from '../../src/components';

/**
 * The auth flow shares one backdrop so the aurora stays put as screens push
 * and pop. Native headers are off: each screen renders its own GlassHeader,
 * matching the rest of the app.
 */
export default function AuthLayout() {
  return (
    <View style={styles.container}>
      <GradientBackdrop />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: styles.scene,
        }}
      >
        <Stack.Screen name="org-code" />
        <Stack.Screen name="phone" />
        <Stack.Screen name="verify" />
        <Stack.Screen name="profile-setup" />
      </Stack>
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
