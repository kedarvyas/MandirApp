import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { decode } from 'base64-arraybuffer';
import {
  borderRadius,
  spacing,
  Theme,
  typography,
} from '../src/constants/theme';
import {
  Button,
  Input,
  GlassHeader,
  GlassSurface,
  GradientBackdrop,
  useHeaderHeight,
} from '../src/components';
import { useTheme, useThemedStyles } from '../src/lib/themeContext';
import { supabase } from '../src/lib/supabase';
import { getStoredOrganization } from '../src/lib/orgContext';
import { usePhotoUpload } from '../src/hooks/usePhotoUpload';

export default function EditProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const headerHeight = useHeaderHeight();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [memberId, setMemberId] = useState<string | null>(null);

  const {
    photoUri: newPhotoUri,
    photoBase64: newPhotoBase64,
    showPhotoOptions,
  } = usePhotoUpload();

  useEffect(() => {
    loadCurrentProfile();
  }, []);

  async function loadCurrentProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.phone) {
        router.replace('/welcome');
        return;
      }

      // Get the current organization
      const storedOrg = await getStoredOrganization();
      if (!storedOrg) {
        router.replace('/(auth)/org-code');
        return;
      }

      const { data: member, error } = await supabase
        .from('members')
        .select('*')
        .eq('phone', user.phone)
        .eq('organization_id', storedOrg.id)
        .single();

      if (error || !member) {
        Alert.alert('Error', 'Could not load profile');
        router.back();
        return;
      }

      setMemberId(member.id);
      setFirstName(member.first_name || '');
      setLastName(member.last_name || '');
      setEmail(member.email || '');
      setCurrentPhotoUrl(member.photo_url);
    } catch (err) {
      console.error('Load profile error:', err);
    } finally {
      setInitialLoading(false);
    }
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave() {
    if (!validate() || !memberId) return;

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'Session expired. Please sign in again.');
        router.replace('/welcome');
        return;
      }

      let photoUrl = currentPhotoUrl;

      // Upload new photo if selected
      if (newPhotoUri && newPhotoBase64) {
        const fileName = `${user.id}-${Date.now()}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from('member-photos')
          .upload(fileName, decode(newPhotoBase64), {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (uploadError) {
          console.error('Photo upload error:', uploadError);
          Alert.alert('Error', `Failed to upload photo: ${uploadError.message}`);
          setLoading(false);
          return;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('member-photos')
          .getPublicUrl(fileName);

        photoUrl = publicUrl;
      }

      // Update member profile
      const { error: updateError } = await supabase
        .from('members')
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim() || null,
          photo_url: photoUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', memberId)
        .select();

      if (updateError) {
        console.error('Profile update error:', updateError);
        Alert.alert('Error', 'Failed to update profile. Please try again.');
        return;
      }

      Alert.alert(
        'Success',
        'Profile updated successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err) {
      console.error('Save profile error:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Display photo - prefer new photo, then current photo
  const displayPhotoUri = newPhotoUri || currentPhotoUrl;

  if (initialLoading) {
    return (
      <View style={styles.container}>
        <GradientBackdrop />
        <GlassHeader title="Edit Profile" onBack={() => router.back()} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GradientBackdrop />
      <GlassHeader title="Edit Profile" onBack={() => router.back()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: headerHeight + spacing.xl },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Photo Upload */}
          <TouchableOpacity
            style={styles.photoContainer}
            onPress={() => showPhotoOptions()}
            activeOpacity={0.7}
          >
            {displayPhotoUri ? (
              <Image source={{ uri: displayPhotoUri }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Feather
                  name="camera"
                  size={26}
                  color={theme.colors.primary.maroon}
                />
                <Text style={styles.photoPlaceholderText}>Add Photo</Text>
              </View>
            )}
            <View style={styles.editBadge}>
              <Text style={styles.editBadgeText}>Edit</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.photoHint}>Tap to change your photo</Text>

          {/* Debug info */}
          {__DEV__ && currentPhotoUrl && (
            <Text style={styles.debugText} numberOfLines={2}>
              Photo URL: {currentPhotoUrl.substring(0, 50)}...
            </Text>
          )}

          <GlassSurface
            variant="strong"
            padding="md"
            radius={borderRadius.xl}
            style={styles.formCard}
          >
            <Input
              label="First Name"
              placeholder="Enter your first name"
              value={firstName}
              onChangeText={(text) => {
                setFirstName(text);
                setErrors((prev) => ({ ...prev, firstName: '' }));
              }}
              autoCapitalize="words"
              error={errors.firstName}
            />

            <Input
              label="Last Name"
              placeholder="Enter your last name"
              value={lastName}
              onChangeText={(text) => {
                setLastName(text);
                setErrors((prev) => ({ ...prev, lastName: '' }));
              }}
              autoCapitalize="words"
              error={errors.lastName}
            />

            <Input
              label="Email (Optional)"
              placeholder="Enter your email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrors((prev) => ({ ...prev, email: '' }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />
          </GlassSurface>

          <View style={styles.footer}>
            <Button
              title="Save Changes"
              onPress={handleSave}
              loading={loading}
              size="lg"
              fullWidth
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    loadingText: {
      fontSize: typography.size.md,
      color: theme.colors.text.secondary,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
    },
    photoContainer: {
      alignSelf: 'center',
      marginBottom: spacing.sm,
      position: 'relative',
    },
    photo: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.colors.background.tertiary,
      borderWidth: 1,
      borderColor: theme.glass.border,
    },
    photoPlaceholder: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.glass.surfaceStrong,
      borderWidth: 2,
      borderColor: theme.colors.primary.maroon,
      borderStyle: 'dashed',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
    },
    photoPlaceholderText: {
      fontSize: typography.size.xs,
      color: theme.colors.text.secondary,
    },
    editBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: theme.colors.primary.maroon,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
      ...theme.shadows.sm,
    },
    editBadgeText: {
      fontSize: typography.size.xs,
      color: theme.colors.text.inverse,
      fontWeight: typography.weight.semibold,
    },
    photoHint: {
      fontSize: typography.size.xs,
      color: theme.colors.text.tertiary,
      textAlign: 'center',
      marginBottom: spacing.lg,
    },
    debugText: {
      fontSize: typography.size.xs,
      color: theme.colors.text.tertiary,
      textAlign: 'center',
      marginBottom: spacing.md,
      paddingHorizontal: spacing.md,
    },
    formCard: {
      marginBottom: spacing.lg,
    },
    footer: {
      marginTop: 'auto',
    },
  });
