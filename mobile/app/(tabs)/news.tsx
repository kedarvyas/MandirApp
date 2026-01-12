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
import { colors, typography, spacing, borderRadius, shadows } from '../../src/constants/theme';
import { Card } from '../../src/components';
import { supabase } from '../../src/lib/supabase';
import { getStoredOrganization } from '../../src/lib/orgContext';
import type { AnnouncementWithAuthor } from '../../src/types/database';

export default function NewsScreen() {
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading news...</Text>
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
      {announcements.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📰</Text>
          <Text style={styles.emptyTitle}>No News Yet</Text>
          <Text style={styles.emptyText}>
            Check back later for announcements and updates from your organization.
          </Text>
        </View>
      ) : (
        announcements.map((announcement) => {
          const isExpanded = expandedId === announcement.id;
          const contentText = stripHtml(announcement.content);
          const shouldTruncate = contentText.length > 150;

          return (
            <Card key={announcement.id} style={styles.newsCard} variant="elevated">
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
                  >
                    <Text style={styles.readMoreText}>
                      {isExpanded ? 'Show less' : 'Read more'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          );
        })
      )}
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

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    lineHeight: typography.size.md * 1.5,
  },

  // News Card
  newsCard: {
    marginBottom: spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: 180,
    backgroundColor: colors.background.tertiary,
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
    color: colors.text.tertiary,
    fontWeight: typography.weight.medium,
  },
  author: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
  },
  title: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    lineHeight: typography.size.lg * 1.3,
  },
  contentText: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
    lineHeight: typography.size.md * 1.6,
  },
  readMoreButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
  },
  readMoreText: {
    fontSize: typography.size.sm,
    color: colors.primary.maroon,
    fontWeight: typography.weight.medium,
  },
});
