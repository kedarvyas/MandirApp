import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import {
  borderRadius,
  spacing,
  Theme,
  typography,
} from '../../src/constants/theme';
import {
  GlassHeader,
  GlassSurface,
  SkeletonNewsScreen,
  useHeaderHeight,
  useTabBarInset,
} from '../../src/components';
import { useTheme, useThemedStyles } from '../../src/lib/themeContext';
import { supabase } from '../../src/lib/supabase';
import { getStoredOrganization } from '../../src/lib/orgContext';
import type { AnnouncementWithAuthor } from '../../src/types/database';

export default function NewsScreen() {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const headerHeight = useHeaderHeight();
  const tabBarInset = useTabBarInset();
  const [announcements, setAnnouncements] = useState<AnnouncementWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchAnnouncements();
    }, [])
  );

  async function fetchAnnouncements() {
    try {
      const storedOrg = await getStoredOrganization();
      if (!storedOrg) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('announcements')
        .select(`
          *,
          author:staff!author_id (
            id,
            name
          )
        `)
        .eq('organization_id', storedOrg.id)
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (error) {
        console.error('Error fetching announcements:', error);
        setLoading(false);
        return;
      }

      setAnnouncements(data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await fetchAnnouncements();
    setRefreshing(false);
  }

  function formatDate(dateString: string | null): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  }

  // Strip HTML tags for plain text display
  function stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  }

  // Truncate text for preview
  function truncateText(text: string, maxLength: number = 150): string {
    const stripped = stripHtml(text);
    if (stripped.length <= maxLength) return stripped;
    return stripped.substring(0, maxLength).trim() + '...';
  }

  function toggleExpand(id: string) {
    setExpandedId(expandedId === id ? null : id);
  }

  return (
    <View style={styles.container}>
      <GlassHeader title="News" />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: headerHeight + spacing.md, paddingBottom: tabBarInset },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary.maroon}
            progressViewOffset={headerHeight}
          />
        }
      >
        {loading ? (
          <SkeletonNewsScreen />
        ) : announcements.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Feather
                name="bell-off"
                size={30}
                color={theme.colors.text.tertiary}
              />
            </View>
            <Text style={styles.emptyTitle}>No news yet</Text>
            <Text style={styles.emptyText}>
              Check back later for announcements and updates from your
              organization.
            </Text>
          </View>
        ) : (
          announcements.map((announcement) => {
            const isExpanded = expandedId === announcement.id;
            const contentText = stripHtml(announcement.content);
            const shouldTruncate = contentText.length > 150;

            return (
              <GlassSurface
                key={announcement.id}
                variant="strong"
                padding="none"
                radius={borderRadius.xl}
                style={styles.newsCard}
              >
                {announcement.image_url && (
                  <Image
                    source={{ uri: announcement.image_url }}
                    style={styles.featuredImage}
                    resizeMode="cover"
                  />
                )}
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.date}>
                      {formatDate(announcement.published_at)}
                    </Text>
                    {announcement.author && (
                      <Text style={styles.author}>
                        by {announcement.author.name}
                      </Text>
                    )}
                  </View>

                  <Text style={styles.title}>{announcement.title}</Text>

                  <Text style={styles.contentText}>
                    {isExpanded || !shouldTruncate
                      ? contentText
                      : truncateText(announcement.content)}
                  </Text>

                  {shouldTruncate && (
                    <TouchableOpacity
                      onPress={() => toggleExpand(announcement.id)}
                      style={styles.readMoreButton}
                      accessibilityRole="button"
                    >
                      <Text style={styles.readMoreText}>
                        {isExpanded ? 'Show less' : 'Read more'}
                      </Text>
                      <Feather
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={15}
                        color={theme.colors.primary.maroon}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </GlassSurface>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      paddingHorizontal: spacing.lg,
    },

    // Empty State
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: spacing.xxxl,
    },
    emptyIconCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.glass.surface,
      borderWidth: 1,
      borderColor: theme.glass.border,
      marginBottom: spacing.lg,
    },
    emptyTitle: {
      fontSize: typography.size.xl,
      fontWeight: typography.weight.bold,
      color: theme.colors.text.primary,
      marginBottom: spacing.sm,
    },
    emptyText: {
      fontSize: typography.size.md,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      paddingHorizontal: spacing.lg,
      lineHeight: typography.size.md * 1.5,
    },

    // News Card
    newsCard: {
      marginBottom: spacing.md,
    },
    featuredImage: {
      width: '100%',
      height: 180,
      backgroundColor: theme.colors.background.tertiary,
    },
    cardContent: {
      padding: spacing.md,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    date: {
      fontSize: typography.size.xs,
      color: theme.colors.text.tertiary,
      fontWeight: typography.weight.medium,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    author: {
      fontSize: typography.size.xs,
      color: theme.colors.text.tertiary,
    },
    title: {
      fontSize: typography.size.lg,
      fontWeight: typography.weight.bold,
      color: theme.colors.text.primary,
      marginBottom: spacing.sm,
      lineHeight: typography.size.lg * 1.3,
      letterSpacing: -0.2,
    },
    contentText: {
      fontSize: typography.size.md,
      color: theme.colors.text.secondary,
      lineHeight: typography.size.md * 1.6,
    },
    readMoreButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginTop: spacing.sm,
      paddingVertical: spacing.xs,
    },
    readMoreText: {
      fontSize: typography.size.sm,
      color: theme.colors.primary.maroon,
      fontWeight: typography.weight.semibold,
    },
  });
