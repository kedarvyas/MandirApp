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
import { decode } from 'base64-arraybuffer';
import { colors, typography, spacing } from '../../src/constants/theme';
import { Button, Input, Card } from '../../src/components';
import { supabase } from '../../src/lib/supabase';
import { getStoredOrganization, type StoredOrganization } from '../../src/lib/orgContext';
import { usePhotoUpload } from '../../src/hooks/usePhotoUpload';

export default function ProfileSetupScreen() {
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [organization, setOrganization] = useState<StoredOrganization | null>(null);

  // Track if this is an existing member or new registration
  const [isExistingMember, setIsExistingMember] = useState(false);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
  const [existingMemberId, setExistingMemberId] = useState<string | null>(null);
  const [existingFamilyGroupId, setExistingFamilyGroupId] = useState<string | null>(null);

  const { photoUri, photoBase64, showPhotoOptions } = usePhotoUpload();

  // Clear photo error when photo is selected
  useEffect(() => {
    if (photoUri) {
      setErrors((prev) => ({ ...prev, photo: '' }));
    }
  }, [photoUri]);

  useEffect(() => {
    loadOrganizationAndMember();
  }, []);

  async function loadOrganizationAndMember() {
    const org = await getStoredOrganization();
    if (!org) {
      Alert.alert('Error', 'Organization not found. Please start over.');
      router.replace('/(auth)/org-code');
      return;
    }
    setOrganization(org);

    // Check if member already exists and pre-fill their data
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.phone) {
        const { data: existingMember } = await supabase
          .from('members')
          .select('id, first_name, last_name, email, photo_url, family_group_id')
          .eq('phone', user.phone)
          .eq('organization_id', org.id)
          .single();

        if (existingMember) {
          setIsExistingMember(true);
          setExistingMemberId(existingMember.id);
          setExistingFamilyGroupId(existingMember.family_group_id);

          // Pre-fill existing data
          if (existingMember.first_name) setFirstName(existingMember.first_name);
          if (existingMember.last_name) setLastName(existingMember.last_name);
          if (existingMember.email) setEmail(existingMember.email);
          if (existingMember.photo_url) setExistingPhotoUrl(existingMember.photo_url);
        }
      }
    } catch {
      // No existing member found, proceeding with new registration
    }

    setInitialLoading(false);
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    // Photo is required only if there's no existing photo and no new photo selected
    if (!photoUri && !existingPhotoUrl) {
      newErrors.photo = 'Profile photo is required';
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleComplete() {
    if (!validate()) return;
    if (!organization) {
      Alert.alert('Error', 'Organization not found. Please start over.');
      router.replace('/(auth)/org-code');
      return;
    }

    setLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'Session expired. Please sign in again.');
        router.replace('/(auth)/phone');
        return;
      }

      // Determine the photo URL to use
      let photoUrl = existingPhotoUrl; // Start with existing photo if any

      // Upload new photo if one was selected
      if (photoUri && photoBase64) {
        const fileName = `${user.id}-${Date.now()}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from('member-photos')
          .upload(fileName, decode(photoBase64), {
            contentType: 'image/jpeg',
          });

        if (uploadError) {
          console.error('Photo upload error:', uploadError);
          Alert.alert('Error', 'Failed to upload photo. Please try again.');
          setLoading(false);
          return;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('member-photos')
          .getPublicUrl(fileName);

        photoUrl = publicUrl;
      }

      // Use tracked family group ID or create new one
      let familyGroupId = existingFamilyGroupId;

      // If no family group, create one
      if (!familyGroupId) {
        const { data: newFamilyGroup, error: familyError } = await supabase
          .from('family_groups')
          .insert({
            organization_id: organization.id,
          })
          .select('id')
          .single();

        if (familyError) {
          console.error('Family group error:', familyError);
          Alert.alert('Error', 'Failed to create profile. Please try again.');
          return;
        }
        familyGroupId = newFamilyGroup.id;
      }

      // Build member data - only include photo if we have one
      const memberData: Record<string, unknown> = {
        phone: user.phone,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim() || null,
        status: 'active' as const,
        is_prime_member: true,
        is_independent: true,
        relationship_to_prime: 'self' as const,
        family_group_id: familyGroupId,
        organization_id: organization.id,
        updated_at: new Date().toISOString(),
      };

      // Only update photo if we have a new one or if this is a new member
      if (photoUrl) {
        memberData.photo_url = photoUrl;
      }

      // Only set membership_date for new members
      if (!isExistingMember) {
        memberData.membership_date = new Date().toISOString().split('T')[0];
      }

      const { error: updateError } = existingMemberId
        ? await supabase
            .from('members')
            .update(memberData)
            .eq('id', existingMemberId)
        : await supabase
            .from('members')
            .insert(memberData);

      if (updateError) {
        console.error('Update error:', updateError);
        Alert.alert('Error', 'Failed to update profile. Please try again.');
        return;
      }

      // Update family group with prime member id if new member
      if (!isExistingMember) {
        const { data: newMember } = await supabase
          .from('members')
          .select('id')
          .eq('phone', user.phone)
          .eq('organization_id', organization.id)
          .single();

        if (newMember) {
          await supabase
            .from('family_groups')
            .update({ prime_member_id: newMember.id })
            .eq('id', familyGroupId);
        }
      }

      // Navigate to main app
      router.replace('/(tabs)');
    } catch (err) {
      console.error('Profile setup error:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Show loading state while fetching existing member data
  if (initialLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Determine which photo to display
  const displayPhotoUri = photoUri || existingPhotoUrl;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            {isExistingMember ? 'Welcome back!' : 'Complete your profile'}
          </Text>
          <Text style={styles.subtitle}>
            {isExistingMember
              ? 'Please verify your details are correct.'
              : 'Add your photo and details to finish setting up your membership.'}
          </Text>
        </View>

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
              <Text style={styles.photoPlaceholderIcon}>+</Text>
              <Text style={styles.photoPlaceholderText}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>
        {errors.photo && (
          <Text style={styles.photoError}>{errors.photo}</Text>
        )}
        <Text style={styles.photoHint}>
          {existingPhotoUrl ? 'Tap to change your photo' : 'Tap to add your photo (required)'}
        </Text>

        <Card style={styles.formCard}>
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
        </Card>

        <View style={styles.footer}>
          <Button
            title={isExistingMember ? 'Continue' : 'Complete Setup'}
            onPress={handleComplete}
            loading={loading}
            size="lg"
            fullWidth
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
    lineHeight: typography.size.md * 1.5,
  },
  photoContainer: {
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  photo: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.background.tertiary,
  },
  photoPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: colors.accent.rose,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderIcon: {
    fontSize: 40,
    color: colors.primary.maroon,
    marginBottom: spacing.xs,
  },
  photoPlaceholderText: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
  },
  photoError: {
    fontSize: typography.size.xs,
    color: colors.semantic.error,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  photoHint: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  formCard: {
    marginBottom: spacing.lg,
  },
  footer: {
    marginTop: 'auto',
  },
});
