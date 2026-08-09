import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  borderRadius,
  spacing,
  Theme,
  typography,
} from '../src/constants/theme';
import {
  GlassHeader,
  GlassSurface,
  GradientBackdrop,
  useHeaderHeight,
} from '../src/components';
import { useTheme, useThemedStyles } from '../src/lib/themeContext';
import {
  getAllOrganizations,
  getActiveOrgId,
  setActiveOrganization,
  removeOrganization,
  StoredOrganization,
} from '../src/lib/orgContext';

export default function OrganizationsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const [organizations, setOrganizations] = useState<StoredOrganization[]>([]);
  const [activeOrgId, setActiveOrgIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadOrganizations();
    }, [])
  );

  async function loadOrganizations() {
    setLoading(true);
    try {
      const orgs = await getAllOrganizations();
      const activeId = await getActiveOrgId();
      setOrganizations(orgs);
      setActiveOrgIdState(activeId);
    } catch (err) {
      console.error('Error loading organizations:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectOrg(org: StoredOrganization) {
    if (org.id === activeOrgId) {
      // Already active, just go back
      router.back();
      return;
    }

    const success = await setActiveOrganization(org.id);
    if (success) {
      setActiveOrgIdState(org.id);
      // Navigate back to home with the new org context
      router.replace('/(tabs)');
    }
  }

  async function handleRemoveOrg(org: StoredOrganization) {
    Alert.alert(
      'Leave Organization',
      `Are you sure you want to leave "${org.name}"? You can rejoin later using their organization code.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            const success = await removeOrganization(org.id);
            if (success) {
              loadOrganizations();
              // If we removed the last org, redirect to org code entry
              const remaining = await getAllOrganizations();
              if (remaining.length === 0) {
                router.replace('/(auth)/org-code');
              }
            }
          },
        },
      ]
    );
  }

  function handleAddOrg() {
    router.push('/(auth)/org-code');
  }

  function renderOrgItem({ item: org }: { item: StoredOrganization }) {
    const isActive = org.id === activeOrgId;

    return (
      <TouchableOpacity
        onPress={() => handleSelectOrg(org)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityState={{ selected: isActive }}
        style={styles.orgCardWrapper}
      >
        <GlassSurface
          variant="strong"
          padding="md"
          radius={borderRadius.xl}
          contentStyle={styles.orgCard}
          style={isActive ? styles.orgCardActive : undefined}
        >
        {/* Org Logo/Initial */}
        <View
          style={[
            styles.orgLogo,
            {
              backgroundColor:
                org.primary_color || theme.colors.primary.brand,
            },
          ]}
        >
          <Text style={styles.orgLogoText}>
            {org.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        {/* Org Info */}
        <View style={styles.orgInfo}>
          <Text style={styles.orgName}>{org.name}</Text>
          <Text style={styles.orgCode}>Code: {org.org_code}</Text>
          {isActive && (
            <View style={styles.activeIndicator}>
              <Feather
                name="check-circle"
                size={14}
                color={theme.colors.semantic.success}
              />
              <Text style={styles.activeText}>Active</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.orgActions}>
          {!isActive && organizations.length > 1 && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveOrg(org)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="x" size={20} color={theme.colors.text.tertiary} />
            </TouchableOpacity>
          )}
          <Feather
            name="chevron-right"
            size={22}
            color={theme.colors.text.tertiary}
          />
        </View>
        </GlassSurface>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <GradientBackdrop />
      <GlassHeader
        title="My Organizations"
        onBack={router.canGoBack() ? () => router.back() : undefined}
      />

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={theme.colors.primary.maroon}
          />
        </View>
      ) : (
        <View
          style={[
            styles.content,
            {
              paddingTop: headerHeight + spacing.lg,
              paddingBottom: Math.max(insets.bottom, spacing.md),
            },
          ]}
        >
          {organizations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Feather
                  name="home"
                  size={40}
                  color={theme.colors.text.tertiary}
                />
              </View>
              <Text style={styles.emptyTitle}>No Organizations</Text>
              <Text style={styles.emptyText}>
                Join an organization by entering their code
              </Text>
            </View>
          ) : (
            <FlatList
              data={organizations}
              keyExtractor={(item) => item.id}
              renderItem={renderOrgItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* Add Organization Button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddOrg}
            activeOpacity={0.8}
          >
            <Feather
              name="plus"
              size={22}
              color={theme.colors.text.inverse}
            />
            <Text style={styles.addButtonText}>Join Another Organization</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.lg,
    },
    listContent: {
      paddingBottom: spacing.lg,
    },
    orgCardWrapper: {
      marginBottom: spacing.md,
    },
    orgCard: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    orgCardActive: {
      borderWidth: 1.5,
      borderColor: theme.colors.semantic.success,
      borderRadius: borderRadius.xl,
    },
    orgLogo: {
      width: 52,
      height: 52,
      borderRadius: borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    orgLogoText: {
      fontSize: 22,
      fontWeight: typography.weight.bold,
      // The tile is filled with the org's own brand colour, which is dark by
      // convention, so this stays white in both appearances.
      color: '#FFFFFF',
    },
    orgInfo: {
      flex: 1,
      marginLeft: spacing.md,
    },
    orgName: {
      fontSize: typography.size.lg,
      fontWeight: typography.weight.semibold,
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    orgCode: {
      fontSize: typography.size.sm,
      color: theme.colors.text.tertiary,
      letterSpacing: 0.5,
    },
    activeIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.xs,
      gap: 4,
    },
    activeText: {
      fontSize: typography.size.sm,
      fontWeight: typography.weight.medium,
      color: theme.colors.semantic.success,
    },
    orgActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    removeButton: {
      padding: spacing.xs,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: 100,
    },
    emptyIcon: {
      width: 92,
      height: 92,
      borderRadius: 46,
      backgroundColor: theme.glass.surface,
      borderWidth: 1,
      borderColor: theme.glass.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
    },
    emptyTitle: {
      fontSize: typography.size.xl,
      fontWeight: typography.weight.semibold,
      color: theme.colors.text.primary,
      marginBottom: spacing.sm,
    },
    emptyText: {
      fontSize: typography.size.md,
      color: theme.colors.text.tertiary,
      textAlign: 'center',
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary.maroon,
      borderRadius: borderRadius.full,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      marginTop: 'auto',
      marginBottom: spacing.md,
      gap: spacing.sm,
      ...theme.shadows.md,
    },
    addButtonText: {
      fontSize: typography.size.md,
      fontWeight: typography.weight.semibold,
      color: theme.colors.text.inverse,
    },
  });
