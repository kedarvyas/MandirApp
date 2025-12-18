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
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { colors, typography, spacing, borderRadius } from '../src/constants/theme';
import { Button, Input, Card } from '../src/components';
import { supabase } from '../src/lib/supabase';

export default function EditProfileScreen() {
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);
  const [newPhotoUri, setNewPhotoUri] = useState<string | null>(null);
  const [newPhotoBase64, setNewPhotoBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [memberId, setMemberId] = useState<string | null>(null);

  useEffect(() => {
    loadCurrentProfile();
  }, []);

  async function loadCurrentProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.phone) {
        router.replace('/');
        return;
      }

      const { data: member, error } = await supabase
        .from('members')
        .select('*')
        .eq('phone', user.phone)
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

      // Debug: Log the current photo URL
      console.log('Current photo_url from database:', member.photo_url);
    } catch (err) {
      console.error('Load profile error:', err);
    } finally {
      setInitialLoading(false);
    }
  }

  async function pickImage() {
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
      base64: true, // Get base64 directly
    });

    if (!result.canceled && result.assets[0]) {
      setNewPhotoUri(result.assets[0].uri);
      // Store base64 for upload
      setNewPhotoBase64(result.assets[0].base64 || null);
    }
  }

  async function takePhoto() {
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
      base64: true, // Get base64 directly
    });

    if (!result.canceled && result.assets[0]) {
      setNewPhotoUri(result.assets[0].uri);
      setNewPhotoBase64(result.assets[0].base64 || null);
    }
  }

  function showPhotoOptions() {
    Alert.alert('Profile Photo', 'Choose how to update your photo', [
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
        router.replace('/');
        return;
      }

      let photoUrl = currentPhotoUrl;

      // Upload new photo if selected
      if (newPhotoUri && newPhotoBase64) {
        const fileName = `${user.id}-${Date.now()}.jpg`;
        console.log('Uploading photo, base64 size:', newPhotoBase64.length);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('member-photos')
          .upload(fileName, decode(newPhotoBase64), {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          Alert.alert('Error', `Failed to upload photo: ${uploadError.message}`);
          setLoading(false);
          return;
        }

        console.log('Upload successful:', uploadData);

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('member-photos')
          .getPublicUrl(fileName);

        console.log('Public URL generated:', publicUrl);
        photoUrl = publicUrl;
      }

      // Update member profile
      console.log('Updating member profile with photo_url:', photoUrl);
      console.log('Member ID:', memberId);

      const { data: updateData, error: updateError } = await supabase
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

      console.log('Update result:', updateData);

      if (updateError) {
        console.error('Update error:', updateError);
        Alert.alert('Error', 'Failed to update profile. Please try again.');
        return;
      }

      Alert.alert(
        'Success',
        `Profile updated! New photo URL saved.`,
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
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.headerButton} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Photo Upload */}
          <TouchableOpacity
            style={styles.photoContainer}
            onPress={showPhotoOptions}
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
              title="Save Changes"
              onPress={handleSave}
              loading={loading}
              size="lg"
              fullWidth
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary.maroon,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary.maroon,
  },
  headerButton: {
    width: 60,
  },
  headerButtonText: {
    fontSize: typography.size.md,
    color: colors.text.inverse,
  },
  headerTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.text.inverse,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
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
    backgroundColor: colors.background.tertiary,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: colors.accent.rose,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderIcon: {
    fontSize: 32,
    color: colors.primary.maroon,
    marginBottom: spacing.xs,
  },
  photoPlaceholderText: {
    fontSize: typography.size.xs,
    color: colors.text.secondary,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary.maroon,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  editBadgeText: {
    fontSize: typography.size.xs,
    color: colors.text.inverse,
    fontWeight: typography.weight.medium,
  },
  photoHint: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  debugText: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
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
