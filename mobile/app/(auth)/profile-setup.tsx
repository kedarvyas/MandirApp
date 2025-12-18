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
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
import { Button, Input, Card } from '../../src/components';
import { supabase } from '../../src/lib/supabase';
import { getStoredOrganization, type StoredOrganization } from '../../src/lib/orgContext';

export default function ProfileSetupScreen() {
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [organization, setOrganization] = useState<StoredOrganization | null>(null);

  useEffect(() => {
    loadOrganization();
  }, []);

  async function loadOrganization() {
    const org = await getStoredOrganization();
    if (!org) {
      Alert.alert('Error', 'Organization not found. Please start over.');
      router.replace('/(auth)/org-code');
      return;
    }
    setOrganization(org);
  }

  async function pickImage() {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photos to upload a profile picture.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setPhotoBase64(result.assets[0].base64 || null);
      setErrors((prev) => ({ ...prev, photo: '' }));
    }
  }

  async function takePhoto() {
    // Request permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your camera to take a profile picture.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setPhotoBase64(result.assets[0].base64 || null);
      setErrors((prev) => ({ ...prev, photo: '' }));
    }
  }

  function showPhotoOptions() {
    Alert.alert('Profile Photo', 'Choose how to add your photo', [
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Choose from Library', onPress: pickImage },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!photoUri) {
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

      let photoUrl = null;

      // Upload photo to Supabase Storage
      if (photoUri && photoBase64) {
        const fileName = `${user.id}-${Date.now()}.jpg`;

        console.log('Uploading photo, base64 size:', photoBase64.length);

        // Upload using base64 directly from ImagePicker
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('member-photos')
          .upload(fileName, decode(photoBase64), {
            contentType: 'image/jpeg',
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          Alert.alert('Error', 'Failed to upload photo. Please try again.');
          setLoading(false);
          return;
        }

        console.log('Upload successful:', uploadData);

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('member-photos')
          .getPublicUrl(fileName);

        console.log('Public URL:', publicUrl);
        photoUrl = publicUrl;
      }

      // Check if member already exists in this organization
      const { data: existingMember } = await supabase
        .from('members')
        .select('id, family_group_id')
        .eq('phone', user.phone)
        .eq('organization_id', organization.id)
        .single();

      let familyGroupId = existingMember?.family_group_id;

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

      // Upsert member profile (insert or update)
      const memberData = {
        phone: user.phone,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim() || null,
        photo_url: photoUrl,
        status: 'active' as const,
        is_prime_member: true,
        is_independent: true,
        relationship_to_prime: 'self' as const,
        family_group_id: familyGroupId,
        organization_id: organization.id,
        membership_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = existingMember
        ? await supabase
            .from('members')
            .update(memberData)
            .eq('id', existingMember.id)
        : await supabase
            .from('members')
            .insert(memberData);

      if (updateError) {
        console.error('Update error:', updateError);
        Alert.alert('Error', 'Failed to update profile. Please try again.');
        return;
      }

      // Update family group with prime member id if new
      if (!existingMember) {
        const { data: newMember } = await supabase
          .from('members')
          .select('id')
          .eq('phone', user.phone)
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
          <Text style={styles.title}>Complete your profile</Text>
          <Text style={styles.subtitle}>
            Add your photo and details to finish setting up your membership.
          </Text>
        </View>

        {/* Photo Upload */}
        <TouchableOpacity
          style={styles.photoContainer}
          onPress={showPhotoOptions}
          activeOpacity={0.7}
        >
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} />
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
          Tap to add your photo (required)
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
            title="Complete Setup"
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
