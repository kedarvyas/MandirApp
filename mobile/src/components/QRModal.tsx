import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Brightness from 'expo-brightness';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const QR_SIZE = SCREEN_WIDTH * 0.75;

interface QRModalProps {
  visible: boolean;
  qrValue: string;
  onClose: () => void;
  memberName?: string;
}

export function QRModal({ visible, qrValue, onClose, memberName }: QRModalProps) {
  const originalBrightness = useRef<number | null>(null);
  const [brightnessRestored, setBrightnessRestored] = useState(false);

  useEffect(() => {
    if (visible) {
      handleOpen();
    }
    return () => {
      // Cleanup: restore brightness if component unmounts while open
      if (originalBrightness.current !== null && !brightnessRestored) {
        Brightness.setBrightnessAsync(originalBrightness.current).catch(() => {});
      }
    };
  }, [visible]);

  async function handleOpen() {
    setBrightnessRestored(false);

    // Haptic feedback on open
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Save current brightness and max it out
    try {
      const currentBrightness = await Brightness.getBrightnessAsync();
      originalBrightness.current = currentBrightness;
      await Brightness.setBrightnessAsync(1);
    } catch (error) {
      console.log('Brightness control not available:', error);
    }
  }

  async function handleClose() {
    // Light haptic on close
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Restore original brightness
    if (originalBrightness.current !== null) {
      try {
        await Brightness.setBrightnessAsync(originalBrightness.current);
        setBrightnessRestored(true);
      } catch (error) {
        console.log('Could not restore brightness:', error);
      }
    }

    onClose();
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <StatusBar barStyle="light-content" />
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalContent}>
            {memberName && (
              <Text style={styles.memberName}>{memberName}</Text>
            )}
            <Text style={styles.title}>Check-in Code</Text>

            <View style={styles.qrContainer}>
              <QRCode
                value={qrValue}
                size={QR_SIZE}
                color={colors.primary.maroon}
                backgroundColor={colors.utility.white}
              />
            </View>

            <Text style={styles.hint}>Tap anywhere to close</Text>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 0,
  },
  modalContent: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  memberName: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.utility.white,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.utility.white,
    marginBottom: spacing.xl,
  },
  qrContainer: {
    backgroundColor: colors.utility.white,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  hint: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xl,
  },
});

export default QRModal;
