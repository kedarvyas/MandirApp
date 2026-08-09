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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import * as Haptics from 'expo-haptics';
import {
  borderRadius,
  spacing,
  Theme,
  typography,
} from '../../src/constants/theme';
import {
  Avatar,
  GlassSurface,
  QRModal,
  SkeletonHomeScreen,
  useTabBarInset,
} from '../../src/components';
import { useTheme, useThemedStyles } from '../../src/lib/themeContext';
import { supabase } from '../../src/lib/supabase';
import { getStoredOrganization, refreshOrganization, StoredOrganization } from '../../src/lib/orgContext';
import { formatPhone } from '../../src/lib/phone';
import type { Member } from '../../src/types/database';

/**
 * The member's check-in pass.
 *
 * The QR code is the only reason this screen exists, so it is the hero: a
 * lifted glass pass card overlapping a deep gradient, with everything else
 * demoted beneath it.
 */

/** How far the pass card rides up over the hero's bottom edge. */
const PASS_OVERLAP = 52;
const QR_SIZE = 190;

/**
 * The hero gradient is extended upwards by this much and pulled back with a
 * matching negative margin, so a rubber-band overscroll reveals more gradient
 * instead of a bare strip of app background.
 */
const OVERSCROLL_PAD = 400;

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarInset = useTabBarInset();
  const styles = useThemedStyles(createStyles);

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

      // If no user or no phone, redirect to auth. Must be "/welcome": "/" would
      // resolve to this very screen, since (tabs) adds no path segment.
      if (!user) {
        router.replace('/welcome');
        return;
      }

      if (!user.phone) {
        setLoading(false);
        return;
      }

      // Get the stored organization for multi-tenancy
      const storedOrg = await getStoredOrganization();
      if (!storedOrg) {
        router.replace('/(auth)/org-code');
        return;
      }

      // Refresh org data from server to get latest name/logo/etc
      const refreshedOrg = await refreshOrganization(storedOrg.id);
      setOrganization(refreshedOrg || storedOrg);

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
        router.replace('/(auth)/profile-setup');
        return;
      }

      // If member exists but profile is incomplete, redirect to profile setup
      if (data.status === 'pending_registration') {
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

  function greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  if (loading) {
    return (
      <ScrollView style={styles.container}>
        <SkeletonHomeScreen />
      </ScrollView>
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

  const fullName = `${member.first_name ?? ''} ${member.last_name ?? ''}`.trim();

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: tabBarInset + spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.text.onImmersive}
            // The refresh spinner sits over the dark hero, so it needs the
            // light treatment regardless of appearance.
            progressBackgroundColor={theme.colors.background.secondary}
          />
        }
      >
        {/* Hero: branding and greeting on a deep gradient */}
        <LinearGradient
          colors={[theme.backdrop.hero[0], theme.backdrop.hero[1]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.hero,
            { paddingTop: insets.top + spacing.md + OVERSCROLL_PAD },
          ]}
        >
          <Text style={styles.wordmark}>sanctum</Text>
          <Text style={styles.greeting}>
            {greeting()}
            {member.first_name ? `, ${member.first_name}` : ''}
          </Text>
          {organization ? (
            <Text style={styles.orgName} numberOfLines={1}>
              {organization.name}
            </Text>
          ) : null}
        </LinearGradient>

        {/* The pass itself */}
        <GlassSurface
          variant="strong"
          padding="none"
          radius={borderRadius.xxl}
          elevation="pass"
          style={styles.pass}
        >
          <View style={styles.passIdentity}>
            <Avatar source={member.photo_url} name={fullName} size="md" />
            <View style={styles.passIdentityText}>
              <Text style={styles.memberName} numberOfLines={1}>
                {fullName || 'Member'}
              </Text>
              <Text style={styles.memberSince} numberOfLines={1}>
                Member since {formatDate(member.membership_date)}
              </Text>
            </View>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Active</Text>
            </View>
          </View>

          {/* A dashed rule, the way a ticket stub tears. React Native only
              honours borderStyle when every side has a width, so the dashes
              come from a fully-bordered box clipped down to its top edge. */}
          <View style={styles.perforationClip}>
            <View style={styles.perforationDashes} />
          </View>

          <TouchableOpacity
            style={styles.qrSection}
            onPress={() => {
              if (member.qr_token) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setQrModalVisible(true);
              }
            }}
            activeOpacity={0.85}
            disabled={!member.qr_token}
            accessibilityRole="button"
            accessibilityLabel="Check-in code. Tap to enlarge."
          >
            {/* The QR plate stays white in both appearances -- scanners need
                dark modules on a light field. */}
            <View style={styles.qrPlate}>
              {member.qr_token ? (
                <QRCode
                  value={member.qr_token}
                  size={QR_SIZE}
                  color="#1A0D14"
                  backgroundColor="#FFFFFF"
                />
              ) : (
                <View style={styles.qrPlaceholder}>
                  <Feather
                    name="alert-circle"
                    size={28}
                    color={theme.colors.text.tertiary}
                  />
                  <Text style={styles.qrPlaceholderText}>
                    QR code not available
                  </Text>
                </View>
              )}
            </View>

            {member.qr_token ? (
              <View style={styles.expandHint}>
                <Feather
                  name="maximize-2"
                  size={13}
                  color={theme.colors.primary.maroon}
                />
                <Text style={styles.expandHintText}>Tap to enlarge</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </GlassSurface>

        <Text style={styles.refreshHint}>
          Pull down to refresh if the code doesn&apos;t scan
        </Text>

        {/* Secondary details */}
        <GlassSurface padding="none" radius={borderRadius.xl} style={styles.details}>
          <DetailRow
            theme={theme}
            styles={styles}
            icon="phone"
            label="Phone"
            value={formatPhone(member.phone) || 'N/A'}
          />
          {member.email ? (
            <DetailRow
              theme={theme}
              styles={styles}
              icon="mail"
              label="Email"
              value={member.email}
              last
            />
          ) : null}
        </GlassSurface>
      </ScrollView>

      {/* QR Expansion Modal */}
      {member.qr_token ? (
        <QRModal
          visible={qrModalVisible}
          qrValue={member.qr_token}
          onClose={() => setQrModalVisible(false)}
          memberName={fullName}
        />
      ) : null}
    </View>
  );
}

function DetailRow({
  theme,
  styles,
  icon,
  label,
  value,
  last = false,
}: {
  theme: Theme;
  styles: ReturnType<typeof createStyles>;
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.detailRow, last && styles.detailRowLast]}>
      <Feather name={icon} size={16} color={theme.colors.text.tertiary} />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      // The hero is full-bleed, so horizontal padding lives on the children.
      paddingBottom: spacing.xxl,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: typography.size.md,
      color: theme.colors.text.secondary,
    },

    // Hero
    hero: {
      marginTop: -OVERSCROLL_PAD,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl + PASS_OVERLAP,
      borderBottomLeftRadius: borderRadius.xxl,
      borderBottomRightRadius: borderRadius.xxl,
    },
    wordmark: {
      fontSize: typography.size.lg,
      fontWeight: typography.weight.semibold,
      color: theme.colors.text.onImmersive,
      letterSpacing: 3,
      opacity: 0.75,
      marginBottom: spacing.lg,
    },
    greeting: {
      fontSize: typography.size.xxl,
      fontWeight: typography.weight.bold,
      color: theme.colors.text.onImmersive,
      letterSpacing: -0.3,
    },
    orgName: {
      fontSize: typography.size.sm,
      fontWeight: typography.weight.medium,
      color: theme.colors.text.onImmersive,
      opacity: 0.7,
      letterSpacing: 1.1,
      textTransform: 'uppercase',
      marginTop: spacing.xs,
    },

    // Pass card
    pass: {
      marginHorizontal: spacing.lg,
      marginTop: -PASS_OVERLAP,
    },
    passIdentity: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      gap: spacing.sm + 4,
    },
    passIdentityText: {
      flex: 1,
    },
    memberName: {
      fontSize: typography.size.lg,
      fontWeight: typography.weight.bold,
      color: theme.colors.text.primary,
      letterSpacing: -0.2,
    },
    memberSince: {
      fontSize: typography.size.xs,
      color: theme.colors.text.tertiary,
      marginTop: 2,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs + 1,
      backgroundColor: theme.colors.semantic.successLight,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs + 1,
      borderRadius: borderRadius.full,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.semantic.success,
    },
    statusText: {
      fontSize: typography.size.xs,
      fontWeight: typography.weight.semibold,
      color: theme.colors.semantic.success,
    },
    perforationClip: {
      height: 1,
      overflow: 'hidden',
      marginHorizontal: spacing.md,
    },
    perforationDashes: {
      height: 2,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: theme.colors.utility.divider,
      borderRadius: 1,
    },

    // QR
    qrSection: {
      alignItems: 'center',
      paddingTop: spacing.lg,
      paddingBottom: spacing.md,
    },
    qrPlate: {
      backgroundColor: '#FFFFFF',
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      ...theme.shadows.sm,
    },
    qrPlaceholder: {
      width: QR_SIZE,
      height: QR_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    qrPlaceholderText: {
      fontSize: typography.size.sm,
      color: theme.colors.text.tertiary,
      textAlign: 'center',
    },
    expandHint: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs + 2,
      marginTop: spacing.md,
    },
    expandHintText: {
      fontSize: typography.size.xs,
      fontWeight: typography.weight.medium,
      color: theme.colors.primary.maroon,
      letterSpacing: 0.2,
    },

    refreshHint: {
      fontSize: typography.size.xs,
      color: theme.colors.text.tertiary,
      textAlign: 'center',
      marginTop: spacing.md,
      marginBottom: spacing.lg,
    },

    // Details
    details: {
      marginHorizontal: spacing.lg,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm + 2,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md - 2,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.utility.divider,
    },
    detailRowLast: {
      borderBottomWidth: 0,
    },
    detailLabel: {
      fontSize: typography.size.sm,
      color: theme.colors.text.secondary,
    },
    detailValue: {
      flex: 1,
      textAlign: 'right',
      fontSize: typography.size.sm,
      fontWeight: typography.weight.medium,
      color: theme.colors.text.primary,
    },
  });
