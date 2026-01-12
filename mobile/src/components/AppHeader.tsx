import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing } from '../constants/theme';

interface AppHeaderProps {
  onMenuPress: () => void;
}

export function AppHeader({ onMenuPress }: AppHeaderProps) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary.maroon} />

      {/* Logo on the left - premium styling */}
      <Text style={styles.logo}>sanctum</Text>

      {/* Menu icon on the right */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={onMenuPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        activeOpacity={0.7}
      >
        <Feather name="menu" size={24} color={colors.text.inverse} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary.maroon,
    paddingTop: Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight || 0) + 12,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    fontSize: 28,
    fontWeight: '600', // Semibold - premium, not cheap
    color: colors.text.inverse,
    letterSpacing: 1.5, // Refined spacing, not excessive
    // System font (SF Pro on iOS) is elegant when styled properly
  },
  menuButton: {
    padding: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
