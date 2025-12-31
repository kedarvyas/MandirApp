import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
import { Card, Avatar, Button } from '../../src/components';
import { supabase } from '../../src/lib/supabase';
import { getStoredOrganization } from '../../src/lib/orgContext';
import type { Member, RelationshipType } from '../../src/types/database';

const relationshipLabels: Record<RelationshipType, string> = {
  self: 'You',
  spouse: 'Spouse',
  child: 'Child',
  parent: 'Parent',
  in_law: 'In-Law',
  sibling: 'Sibling',
  other: 'Family',
};

export default function FamilyScreen() {
  const router = useRouter();
  const [familyMembers, setFamilyMembers] = useState<Member[]>([]);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchFamilyData();
    }, [])
  );

  async function fetchFamilyData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.phone) return;

      // Get the current organization
      const storedOrg = await getStoredOrganization();
      if (!storedOrg) return;

      // Get current member (filtered by org to handle multi-org users)
      const { data: member, error: memberError } = await supabase
        .from('members')
        .select('*')
        .eq('phone', user.phone)
        .eq('organization_id', storedOrg.id)
        .single();

      if (memberError || !member) {
        console.error('Fetch member error:', memberError);
        return;
      }

      setCurrentMember(member);

      // Get family members
      if (member.family_group_id) {
        const { data: family, error: familyError } = await supabase
          .from('members')
          .select('*')
          .eq('family_group_id', member.family_group_id)
          .neq('id', member.id)
          .order('created_at', { ascending: true });

        if (familyError) {
          console.error('Fetch family error:', familyError);
          return;
        }

        setFamilyMembers(family || []);
      }
    } catch (err) {
      console.error('Error fetching family:', err);
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await fetchFamilyData();
    setRefreshing(false);
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary.maroon}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Your Family</Text>
        <Text style={styles.subtitle}>
          Manage family members linked to your membership
        </Text>
      </View>

      {/* Current Member (You) */}
      {currentMember && (
        <Card style={styles.memberCard}>
          <View style={styles.memberRow}>
            <Avatar
              source={currentMember.photo_url}
              name={`${currentMember.first_name} ${currentMember.last_name}`}
              size="md"
            />
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>
                {currentMember.first_name} {currentMember.last_name}
              </Text>
              <View style={styles.badges}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>You</Text>
                </View>
                {currentMember.is_prime_member && (
                  <View style={[styles.badge, styles.primeBadge]}>
                    <Text style={[styles.badgeText, styles.primeBadgeText]}>
                      Primary
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <View style={styles.qrIndicator}>
              <Text style={styles.qrIcon}>✓</Text>
            </View>
          </View>
        </Card>
      )}

      {/* Family Members */}
      {familyMembers.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>
            Family Members ({familyMembers.length})
          </Text>
          {familyMembers.map((member) => (
            <Card key={member.id} style={styles.memberCard}>
              <View style={styles.memberRow}>
                <Avatar
                  source={member.photo_url}
                  name={`${member.first_name} ${member.last_name}`}
                  size="md"
                />
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>
                    {member.first_name} {member.last_name}
                  </Text>
                  <View style={styles.badges}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {relationshipLabels[member.relationship_to_prime] || 'Family'}
                      </Text>
                    </View>
                    {!member.is_independent && (
                      <View style={[styles.badge, styles.dependentBadge]}>
                        <Text style={[styles.badgeText, styles.dependentBadgeText]}>
                          Dependent
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                {member.is_independent && member.qr_token && (
                  <View style={styles.qrIndicator}>
                    <Text style={styles.qrIcon}>✓</Text>
                  </View>
                )}
              </View>
            </Card>
          ))}
        </>
      ) : (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>👨‍👩‍👧‍👦</Text>
          <Text style={styles.emptyTitle}>No Family Members Yet</Text>
          <Text style={styles.emptyText}>
            Add your spouse, children, parents, or other family members to link them to your membership.
          </Text>
        </Card>
      )}

      {/* Add Family Button */}
      {currentMember?.is_prime_member && (
        <View style={styles.addButtonContainer}>
          <Button
            title="Add Family Member"
            onPress={() => router.push('/add-family-member')}
            variant="secondary"
            fullWidth
          />
        </View>
      )}

      {/* Info Note */}
      <View style={styles.infoNote}>
        <Text style={styles.infoNoteText}>
          {currentMember?.is_prime_member
            ? 'As the primary member, you can add family members to your group.'
            : 'Contact the primary member to add or manage family members.'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  loadingText: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
  },

  // Header
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
  },

  // Section
  sectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },

  // Member Card
  memberCard: {
    marginBottom: spacing.sm,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  memberName: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  badge: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontSize: typography.size.xs,
    color: colors.text.secondary,
  },
  primeBadge: {
    backgroundColor: colors.primary.maroon,
  },
  primeBadgeText: {
    color: colors.text.inverse,
  },
  dependentBadge: {
    backgroundColor: colors.semantic.warningLight,
  },
  dependentBadgeText: {
    color: colors.semantic.warning,
  },
  qrIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.semantic.successLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrIcon: {
    fontSize: 16,
    color: colors.semantic.success,
  },

  // Empty State
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.size.sm * 1.5,
  },

  // Add Button
  addButtonContainer: {
    marginTop: spacing.lg,
  },

  // Info Note
  infoNote: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.semantic.infoLight,
    borderRadius: borderRadius.sm,
  },
  infoNoteText: {
    fontSize: typography.size.sm,
    color: colors.semantic.info,
    textAlign: 'center',
  },
});
