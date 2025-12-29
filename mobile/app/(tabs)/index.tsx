import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import { colors, typography, spacing, borderRadius, shadows } from '../../src/constants/theme';
import { Card, Avatar, QRModal } from '../../src/components';
import { supabase } from '../../src/lib/supabase';
import { getStoredOrganization, StoredOrganization } from '../../src/lib/orgContext';
import type { Member } from '../../src/types/database';

export default function HomeScreen() {
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [organization, setOrganization] = useState<StoredOrganization | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchMemberData();
    }, [])
  );

  async function fetchMemberData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // If no user or no phone, redirect to auth
      if (!user) {
        router.replace('/');
        return;
      }

      if (!user.phone) {
        console.log('No phone number found for user');
        setLoading(false);
        return;
      }

      // Get the stored organization for multi-tenancy
      const storedOrg = await getStoredOrganization();
      if (!storedOrg) {
        console.log('No organization found, redirecting to org code entry');
        router.replace('/(auth)/org-code');
        return;
      }
      setOrganization(storedOrg);

      // Query member scoped to the current organization
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('phone', user.phone)
        .eq('organization_id', storedOrg.id)
        .maybeSingle();

      if (error) {
        console.error('Fetch member error:', error);
        setLoading(false);
        return;
      }

      // If no member record exists, redirect to profile setup
      if (!data) {
        console.log('No member record found, redirecting to profile setup');
        router.replace('/(auth)/profile-setup');
        return;
      }

      // Debug: Log the photo_url
      console.log('Member data loaded - photo_url:', data.photo_url);

      // If member exists but profile is incomplete, redirect to profile setup
      if (data.status === 'pending_registration') {
        console.log('Profile incomplete, redirecting to profile setup');
        router.replace('/(auth)/profile-setup');
        return;
      }

      setMember(data);
    } catch (err) {
      console.error('Error fetching member:', err);
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await fetchMemberData();
    setRefreshing(false);
  }

  // Format membership date
  function formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // If no member data (edge case), show a message
  if (!member) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Setting up your profile...</Text>
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
      {/* Member Info Header */}
      <Card style={styles.profileCard} variant="elevated">
        <View style={styles.profileHeader}>
          <Avatar
            source={member.photo_url}
            name={`${member.first_name || ''} ${member.last_name || ''}`}
            size="lg"
          />
          <View style={styles.profileInfo}>
            <Text style={styles.memberName}>
              {member.first_name} {member.last_name}
            </Text>
            <Text style={styles.memberSince}>
              Member since {formatDate(member.membership_date)}
            </Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Active Member</Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Organization Header */}
      {organization && (
        <View style={styles.orgHeader}>
          <Text style={styles.orgName}>{organization.name}</Text>
        </View>
      )}

      {/* QR Code Card */}
      <Card style={styles.qrCard} variant="elevated" padding="lg">
        <Text style={styles.qrTitle}>Your Check-in Code</Text>
        <Text style={styles.qrSubtitle}>
          Tap to expand for easier scanning
        </Text>

        <TouchableOpacity
          style={styles.qrContainer}
          onPress={() => member.qr_token && setQrModalVisible(true)}
          activeOpacity={0.8}
        >
          <View style={styles.qrWrapper}>
            {member.qr_token ? (
              <QRCode
                value={member.qr_token}
                size={200}
                color={colors.primary.maroon}
                backgroundColor={colors.utility.white}
              />
            ) : (
              <View style={styles.qrPlaceholder}>
                <Text style={styles.qrPlaceholderText}>
                  QR Code Not Available
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <Text style={styles.qrHint}>
          Pull down to refresh if the code doesn't scan
        </Text>
      </Card>

      {/* QR Expansion Modal */}
      {member.qr_token && (
        <QRModal
          visible={qrModalVisible}
          qrValue={member.qr_token}
          onClose={() => setQrModalVisible(false)}
          memberName={`${member.first_name} ${member.last_name}`}
        />
      )}

      {/* Quick Info */}
      <Card style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phone</Text>
          <Text style={styles.infoValue}>
            {member.phone?.replace(/(\+1)(\d{3})(\d{3})(\d{4})/, '($2) $3-$4') || 'N/A'}
          </Text>
        </View>
        {member.email && (
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{member.email}</Text>
          </View>
        )}
      </Card>
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

  // Organization Header
  orgHeader: {
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  orgName: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Profile Card
  profileCard: {
    marginBottom: spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  memberName: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  memberSince: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  statusBadge: {
    backgroundColor: colors.semantic.successLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    color: colors.semantic.success,
  },

  // QR Card
  qrCard: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  qrTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  qrSubtitle: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  qrContainer: {
    padding: spacing.md,
    backgroundColor: colors.utility.white,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  qrWrapper: {
    padding: spacing.md,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  qrPlaceholderText: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  qrHint: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
    marginTop: spacing.md,
    textAlign: 'center',
  },

  // Info Card
  infoCard: {
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.utility.divider,
  },
  infoLabel: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
  },
  infoValue: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.text.primary,
  },
});
