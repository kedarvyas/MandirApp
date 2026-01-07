import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface PhotoUploadState {
  uri: string | null;
  base64: string | null;
}

interface UsePhotoUploadOptions {
  aspect?: [number, number];
  quality?: number;
  onError?: (error: string) => void;
}

interface UsePhotoUploadReturn {
  photoUri: string | null;
  photoBase64: string | null;
  pickImage: () => Promise<void>;
  takePhoto: () => Promise<void>;
  showPhotoOptions: (title?: string) => void;
  clearPhoto: () => void;
  setPhoto: (uri: string | null, base64?: string | null) => void;
}

export function usePhotoUpload(options: UsePhotoUploadOptions = {}): UsePhotoUploadReturn {
  const { aspect = [1, 1], quality = 0.8, onError } = options;

  const [photo, setPhotoState] = useState<PhotoUploadState>({
    uri: null,
    base64: null,
  });

  const pickImage = useCallback(async () => {
    try {
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
        aspect,
        quality,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotoState({
          uri: result.assets[0].uri,
          base64: result.assets[0].base64 || null,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to pick image';
      onError?.(message);
    }
  }, [aspect, quality, onError]);

  const takePhoto = useCallback(async () => {
    try {
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
        aspect,
        quality,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotoState({
          uri: result.assets[0].uri,
          base64: result.assets[0].base64 || null,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to take photo';
      onError?.(message);
    }
  }, [aspect, quality, onError]);

  const showPhotoOptions = useCallback((title: string = 'Profile Photo') => {
    Alert.alert(title, 'Choose how to add your photo', [
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Choose from Library', onPress: pickImage },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [takePhoto, pickImage]);

  const clearPhoto = useCallback(() => {
    setPhotoState({ uri: null, base64: null });
  }, []);

  const setPhoto = useCallback((uri: string | null, base64: string | null = null) => {
    setPhotoState({ uri, base64 });
  }, []);

  return {
    photoUri: photo.uri,
    photoBase64: photo.base64,
    pickImage,
    takePhoto,
    showPhotoOptions,
    clearPhoto,
    setPhoto,
  };
}
