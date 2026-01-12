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
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../src/constants/theme';
import {
  getAllOrganizations,
  getActiveOrgId,
  setActiveOrganization,
  removeOrganization,
  StoredOrganization,
} from '../src/lib/orgContext';

export default function OrganizationsScreen() {
  const router = useRouter();
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
        style={[styles.orgCard, isActive && styles.orgCardActive]}
        onPress={() => handleSelectOrg(org)}
        activeOpacity={0.7}
      >
        {/* Org Logo/Initial */}
        <View style={[styles.orgLogo, { backgroundColor: org.primary_color || colors.primary.maroon }]}>
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
              <Feather name="check-circle" size={14} color={colors.semantic.success} />
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
              <Feather name="x" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          )}
          <Feather name="chevron-right" size={24} color={colors.text.tertiary} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="arrow-left" size={24} color={colors.text.inverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Organizations</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.maroon} />
        </View>
      ) : (
        <View style={styles.content}>
          {organizations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Feather name="home" size={48} color={colors.text.tertiary} />
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
            <Feather name="plus" size={24} color={colors.text.inverse} />
            <Text style={styles.addButtonText}>Join Another Organization</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    backgroundColor: colors.primary.maroon,
    paddingTop: 54,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.size.xl,
    fontWeight: '600',
    color: colors.text.inverse,
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  orgCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.utility.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  orgCardActive: {
    borderColor: colors.semantic.success,
    backgroundColor: colors.semantic.successLight,
  },
  orgLogo: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orgLogoText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.inverse,
  },
  orgInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  orgName: {
    fontSize: typography.size.lg,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  orgCode: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
  },
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: 4,
  },
  activeText: {
    fontSize: typography.size.sm,
    fontWeight: '500',
    color: colors.semantic.success,
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
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.size.xl,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.size.md,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.maroon,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: 'auto',
    marginBottom: spacing.xl,
    gap: spacing.sm,
    ...shadows.md,
  },
  addButtonText: {
    fontSize: typography.size.lg,
    fontWeight: '600',
    color: colors.text.inverse,
  },
});
