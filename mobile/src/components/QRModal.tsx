import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import * as Brightness from 'expo-brightness';
import * as Haptics from 'expo-haptics';
import {
  borderRadius,
  spacing,
  Theme,
  typography,
} from '../constants/theme';
import { useTheme, useThemedStyles } from '../lib/themeContext';
import { GlassSurface } from './GlassSurface';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const QR_SIZE = Math.min(SCREEN_WIDTH * 0.68, 300);
const CAN_BLUR = Platform.OS === 'ios';

interface QRModalProps {
  visible: boolean;
  qrValue: string;
  onClose: () => void;
  memberName?: string;
}

export function QRModal({ visible, qrValue, onClose, memberName }: QRModalProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
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
    } catch {
      // Brightness control not available on this device
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
      } catch {
        // Could not restore brightness
      }
    }

    onClose();
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      {/* Tapping the scrim closes; the sheet itself swallows the press so a
          tap on the QR does not dismiss it mid-scan. */}
      <Pressable style={styles.scrim} onPress={handleClose}>
        {CAN_BLUR ? (
          <BlurView
            intensity={40}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        <View style={styles.scrimTint} />

        <Pressable onPress={(event) => event.stopPropagation()}>
          <GlassSurface
            variant="strong"
            padding="lg"
            radius={borderRadius.xxl}
            elevation="pass"
            contentStyle={styles.sheet}
          >
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel="Close check-in code"
            >
              <Feather name="x" size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>

            <Text style={styles.title}>Check-in Code</Text>
            {memberName ? (
              <Text style={styles.memberName}>{memberName}</Text>
            ) : null}

            {/* White plate in both appearances -- scanners need dark modules
                on a light field. */}
            <View style={styles.qrPlate}>
              <QRCode
                value={qrValue}
                size={QR_SIZE}
                color="#1A0D14"
                backgroundColor="#FFFFFF"
              />
            </View>

            <Text style={styles.hint}>
              Screen brightness raised for scanning
            </Text>
          </GlassSurface>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    scrim: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg,
    },
    scrimTint: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: CAN_BLUR ? 'rgba(20, 8, 16, 0.55)' : 'rgba(20, 8, 16, 0.92)',
    },
    sheet: {
      alignItems: 'center',
    },
    closeButton: {
      position: 'absolute',
      top: 0,
      right: 0,
      padding: spacing.xs,
    },
    title: {
      fontSize: typography.size.xl,
      fontWeight: typography.weight.bold,
      color: theme.colors.text.primary,
      letterSpacing: -0.2,
    },
    memberName: {
      fontSize: typography.size.sm,
      color: theme.colors.text.secondary,
      marginTop: 2,
    },
    qrPlate: {
      backgroundColor: '#FFFFFF',
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      marginTop: spacing.lg,
    },
    hint: {
      fontSize: typography.size.xs,
      color: theme.colors.text.tertiary,
      marginTop: spacing.md,
      textAlign: 'center',
    },
  });

export default QRModal;
