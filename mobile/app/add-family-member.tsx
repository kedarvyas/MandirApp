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
import type { RelationshipType } from '../src/types/database';

const relationshipOptions: { value: RelationshipType; label: string }[] = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'child', label: 'Child' },
  { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'in_law', label: 'In-Law' },
  { value: 'other', label: 'Other' },
];

export default function AddFamilyMemberScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const headerHeight = useHeaderHeight();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [relationship, setRelationship] = useState<RelationshipType>('spouse');
  const [isIndependent, setIsIndependent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { photoUri, photoBase64, showPhotoOptions } = usePhotoUpload();

  // Clear photo error when photo is selected
  useEffect(() => {
    if (photoUri) {
      setErrors((prev) => ({ ...prev, photo: '' }));
    }
  }, [photoUri]);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleAdd() {
    if (!validate()) return;

    setLoading(true);

    try {
      // Get current user and their member record
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.phone) {
        Alert.alert('Error', 'Session expired. Please sign in again.');
        router.replace('/(auth)/phone');
        return;
      }

      // Get the current organization
      const storedOrg = await getStoredOrganization();
      if (!storedOrg) {
        Alert.alert('Error', 'No organization selected.');
        return;
      }

      // Get current member's family group
      const { data: currentMember, error: memberError } = await supabase
        .from('members')
        .select('id, family_group_id, organization_id')
        .eq('phone', user.phone)
        .eq('organization_id', storedOrg.id)
        .single();

      if (memberError || !currentMember?.family_group_id) {
        Alert.alert('Error', 'Could not find your family group.');
        return;
      }

      let photoUrl = null;

      // Upload photo if provided
      if (photoUri && photoBase64) {
        const fileName = `family-${currentMember.id}-${Date.now()}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from('member-photos')
          .upload(fileName, decode(photoBase64), {
            contentType: 'image/jpeg',
          });

        if (uploadError) {
          console.error('Photo upload error:', uploadError);
          // Continue without photo
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('member-photos')
            .getPublicUrl(fileName);
          photoUrl = publicUrl;
        }
      }

      // Create family member record
      const memberData = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        photo_url: photoUrl,
        status: 'active' as const,
        is_prime_member: false,
        is_independent: isIndependent,
        relationship_to_prime: relationship,
        family_group_id: currentMember.family_group_id,
        organization_id: currentMember.organization_id,
        membership_date: new Date().toISOString().split('T')[0],
        // Independent members get their own QR, dependents don't need phone
        phone: null,
        qr_token: isIndependent ? undefined : null, // Let DB generate for independent
      };

      const { error: insertError } = await supabase
        .from('members')
        .insert(memberData);

      if (insertError) {
        console.error('Insert error:', insertError);
        Alert.alert('Error', 'Failed to add family member. Please try again.');
        return;
      }

      Alert.alert(
        'Success',
        `${firstName} has been added to your family!`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err) {
      console.error('Add family member error:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <GradientBackdrop />
      <GlassHeader title="Add Family Member" onBack={() => router.back()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: headerHeight + spacing.lg },
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
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Feather
                  name="camera"
                  size={24}
                  color={theme.colors.primary.maroon}
                />
                <Text style={styles.photoPlaceholderText}>Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.photoHint}>Tap to add photo (optional)</Text>

          <GlassSurface
            variant="strong"
            padding="md"
            radius={borderRadius.xl}
            style={styles.formCard}
          >
            <Input
              label="First Name"
              placeholder="Enter first name"
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
              placeholder="Enter last name"
              value={lastName}
              onChangeText={(text) => {
                setLastName(text);
                setErrors((prev) => ({ ...prev, lastName: '' }));
              }}
              autoCapitalize="words"
              error={errors.lastName}
            />

            {/* Relationship Selector */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Relationship</Text>
              <View style={styles.relationshipGrid}>
                {relationshipOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.relationshipOption,
                      relationship === option.value && styles.relationshipOptionSelected,
                    ]}
                    onPress={() => setRelationship(option.value)}
                    accessibilityRole="button"
                    accessibilityState={{
                      selected: relationship === option.value,
                    }}
                  >
                    <Text
                      style={[
                        styles.relationshipOptionText,
                        relationship === option.value && styles.relationshipOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Independent Toggle */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Check-in Type</Text>
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.toggleOption,
                    isIndependent && styles.toggleOptionSelected,
                  ]}
                  onPress={() => setIsIndependent(true)}
                >
                  <Text
                    style={[
                      styles.toggleOptionText,
                      isIndependent && styles.toggleOptionTextSelected,
                    ]}
                  >
                    Independent
                  </Text>
                  <Text style={styles.toggleOptionHint}>Gets own QR code</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleOption,
                    !isIndependent && styles.toggleOptionSelected,
                  ]}
                  onPress={() => setIsIndependent(false)}
                >
                  <Text
                    style={[
                      styles.toggleOptionText,
                      !isIndependent && styles.toggleOptionTextSelected,
                    ]}
                  >
                    Dependent
                  </Text>
                  <Text style={styles.toggleOptionHint}>Shows on your scan</Text>
                </TouchableOpacity>
              </View>
            </View>
          </GlassSurface>

          <View style={styles.footer}>
            <Button
              title="Add Family Member"
              onPress={handleAdd}
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
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
    },
    photoContainer: {
      alignSelf: 'center',
      marginBottom: spacing.sm,
    },
    photo: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.colors.background.tertiary,
      borderWidth: 1,
      borderColor: theme.glass.border,
    },
    photoPlaceholder: {
      width: 100,
      height: 100,
      borderRadius: 50,
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
    photoHint: {
      fontSize: typography.size.xs,
      color: theme.colors.text.tertiary,
      textAlign: 'center',
      marginBottom: spacing.lg,
    },
    formCard: {
      marginBottom: spacing.lg,
    },
    fieldContainer: {
      marginTop: spacing.md,
    },
    fieldLabel: {
      fontSize: typography.size.sm,
      fontWeight: typography.weight.medium,
      color: theme.colors.text.secondary,
      marginBottom: spacing.sm,
      marginLeft: spacing.xs,
    },
    relationshipGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    relationshipOption: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      backgroundColor: theme.colors.background.tertiary,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    relationshipOptionSelected: {
      backgroundColor: theme.colors.primary.maroon,
      borderColor: theme.colors.primary.maroon,
    },
    relationshipOptionText: {
      fontSize: typography.size.sm,
      color: theme.colors.text.secondary,
    },
    relationshipOptionTextSelected: {
      color: theme.colors.text.inverse,
      fontWeight: typography.weight.semibold,
    },
    toggleContainer: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    toggleOption: {
      flex: 1,
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      backgroundColor: theme.colors.background.tertiary,
      borderWidth: 1.5,
      borderColor: 'transparent',
      alignItems: 'center',
    },
    toggleOptionSelected: {
      borderColor: theme.colors.primary.maroon,
      backgroundColor: theme.glass.surfaceStrong,
    },
    toggleOptionText: {
      fontSize: typography.size.sm,
      fontWeight: typography.weight.medium,
      color: theme.colors.text.secondary,
      marginBottom: spacing.xs,
    },
    toggleOptionTextSelected: {
      color: theme.colors.primary.maroon,
      fontWeight: typography.weight.semibold,
    },
    toggleOptionHint: {
      fontSize: typography.size.xs,
      color: theme.colors.text.tertiary,
    },
    footer: {
      marginTop: 'auto',
    },
  });
