import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { createAudioPlayer } from 'expo-audio';
import { COLORS, TYPOGRAPHY, ROUNDED } from '../constants/theme';
import ScanLine from './ScanLine';

interface TacticalAlertPopupProps {
  visible: boolean;
  alert: {
    id: string;
    title: string;
    subtitle: string;
    threatLevel: 'HIGH' | 'LOW' | 'MEDIUM';
    matchPercentage?: number;
    lastSeenLocation: string;
    mugshotUrl?: string;
    fileNo?: string;
  } | null;
  onAcknowledge: () => void;
}

const { width, height } = Dimensions.get('window');

export const TacticalAlertPopup: React.FC<TacticalAlertPopupProps> = ({
  visible,
  alert,
  onAcknowledge,
}) => {
  const [player, setPlayer] = useState<any>(null);
  const pulseAnim = React.useRef(new Animated.Value(0.3)).current;

  // Pulse effect logic
  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(0.3);
    }
  }, [visible, pulseAnim]);

  // Audio warning sound playback logic
  useEffect(() => {
    let activePlayer: any = null;

    try {
      if (visible && alert) {
        const p = createAudioPlayer(require('../../assets/audio/alert.mp3'));
        p.loop = true;
        p.volume = 1.0;
        p.play();

        activePlayer = p;
        setPlayer(p);
      }
    } catch (err) {
      console.warn('⚠️ [TACTICAL AUDIO] Failed to load/play alert sound:', err);
    }

    return () => {
      if (activePlayer) {
        try {
          activePlayer.pause();
          activePlayer.release();
          activePlayer.remove();
        } catch (e) {}
      }
    };
  }, [visible, alert]);

  const handleClose = () => {
    if (player) {
      try {
        player.pause();
        player.release();
        player.remove();
      } catch (e) {}
    }
    setPlayer(null);
    onAcknowledge();
  };

  if (!visible || !alert) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Glowing Pulse Border */}
        <Animated.View style={[styles.glowBackground, { opacity: pulseAnim }]} />

        <View style={styles.container}>
          {/* Neon Header */}
          <View style={styles.header}>
            <MaterialIcons name="warning" size={28} color={COLORS.error} />
            <Text style={styles.headerText}>TACTICAL EXCEPTION DETECTED</Text>
          </View>

          {/* Alert Content */}
          <View style={styles.content}>
            {/* Identity Scanning Box */}
            <View style={styles.imageBox}>
              {alert.mugshotUrl ? (
                <Image source={{ uri: alert.mugshotUrl }} style={styles.mugshot} />
              ) : (
                <View style={styles.placeholderImage}>
                  <MaterialIcons name="security" size={48} color={COLORS.primary} />
                </View>
              )}
              <ScanLine color={COLORS.error} duration={1500} />
              <View style={styles.scannerOverlay}>
                <Text style={styles.scannerText}>LIVE BROADCAST INTERCEPT</Text>
              </View>
            </View>

            {/* Target Meta Grid */}
            <View style={styles.metaContainer}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>TARGET CLASSIFICATION</Text>
                <Text style={styles.targetName}>{alert.title}</Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>PROBABILITY MATCH</Text>
                <View style={styles.badgeRow}>
                  <View style={styles.matchBadge}>
                    <Text style={styles.matchText}>
                      {alert.matchPercentage || 98}% CONFIDENCE
                    </Text>
                  </View>
                  <View style={styles.threatBadge}>
                    <Text style={styles.threatText}>{alert.threatLevel} THREAT</Text>
                  </View>
                </View>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>LAST INTERCEPTED BEARING</Text>
                <Text style={styles.metaValue}>
                  <MaterialIcons name="place" size={14} color={COLORS.error} />{' '}
                  {alert.lastSeenLocation}
                </Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>DOSSIER FILE</Text>
                <Text style={styles.metaValueMono}>{alert.fileNo || '#GEN-9902'}</Text>
              </View>
            </View>
          </View>

          {/* Action Row */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleClose}
            activeOpacity={0.8}
          >
            <Animated.View style={[styles.buttonPulse, { opacity: pulseAnim }]} />
            <View style={styles.buttonContent}>
              <MaterialIcons name="gps-fixed" size={20} color={COLORS.onBackground} style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>ACKNOWLEDGE & PLOT INTERCEPT</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 8, 4, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  glowBackground: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 6,
    borderColor: COLORS.error,
    borderRadius: 8,
  },
  container: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: ROUNDED.DEFAULT,
    borderWidth: 2,
    borderColor: COLORS.error,
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: 'rgba(239, 83, 80, 0.08)',
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.error,
    gap: 8,
  },
  headerText: {
    ...TYPOGRAPHY.labelCaps,
    color: COLORS.error,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  imageBox: {
    position: 'relative',
    width: width * 0.45,
    height: width * 0.52,
    borderRadius: ROUNDED.DEFAULT,
    borderWidth: 2,
    borderColor: COLORS.error,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: COLORS.surfaceLow,
  },
  mugshot: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(239, 83, 80, 0.85)',
    paddingVertical: 4,
    alignItems: 'center',
  },
  scannerText: {
    fontSize: 8,
    color: '#000000',
    fontWeight: '900',
    letterSpacing: 1,
  },
  metaContainer: {
    width: '100%',
    gap: 12,
  },
  metaRow: {
    width: '100%',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  metaLabel: {
    ...TYPOGRAPHY.labelCaps,
    fontSize: 8,
    color: COLORS.onSurfaceVariant,
    opacity: 0.8,
  },
  targetName: {
    ...TYPOGRAPHY.headlineSm,
    color: COLORS.onSurface,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  matchBadge: {
    backgroundColor: 'rgba(246, 190, 57, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(246, 190, 57, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: ROUNDED.sm,
  },
  matchText: {
    ...TYPOGRAPHY.dataMono,
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 10,
  },
  threatBadge: {
    backgroundColor: 'rgba(239, 83, 80, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 83, 80, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: ROUNDED.sm,
  },
  threatText: {
    ...TYPOGRAPHY.labelCaps,
    color: COLORS.error,
    fontWeight: '900',
    fontSize: 9,
  },
  metaValue: {
    ...TYPOGRAPHY.bodyLg,
    fontSize: 13,
    color: COLORS.onSurface,
    fontWeight: '700',
    marginTop: 2,
  },
  metaValueMono: {
    ...TYPOGRAPHY.dataMono,
    color: COLORS.onSurface,
    fontSize: 12,
    marginTop: 2,
  },
  actionButton: {
    width: '100%',
    height: 56,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  buttonPulse: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  buttonText: {
    ...TYPOGRAPHY.labelCaps,
    color: COLORS.background,
    fontSize: 12,
    fontWeight: '900',
  },
});
