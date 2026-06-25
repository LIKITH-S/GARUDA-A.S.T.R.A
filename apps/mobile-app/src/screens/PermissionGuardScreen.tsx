import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  PermissionsAndroid,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { COLORS, TYPOGRAPHY, SPACING, ROUNDED } from '../constants/theme';
import PulseIndicator from '../components/PulseIndicator';

interface PermissionGuardScreenProps {
  onAllPermissionsGranted: () => void;
}

export const PermissionGuardScreen: React.FC<PermissionGuardScreenProps> = ({
  onAllPermissionsGranted,
}) => {
  const [foregroundGranted, setForegroundGranted] = useState(false);
  const [backgroundGranted, setBackgroundGranted] = useState(false);
  const [notificationsGranted, setNotificationsGranted] = useState(false);
  const [checking, setChecking] = useState(true);

  const checkPermissions = async () => {
    try {
      // 1. Check Foreground Location
      const { status: fgStatus } = await Location.getForegroundPermissionsAsync();
      const fg = fgStatus === 'granted';
      setForegroundGranted(fg);

      // 2. Check Background Location
      const { status: bgStatus } = await Location.getBackgroundPermissionsAsync();
      const bg = bgStatus === 'granted';
      setBackgroundGranted(bg);

      // 3. Check Notifications
      let notif = true;
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        notif = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
      }
      setNotificationsGranted(notif);

      // Trigger callback if all are already granted
      if (fg && bg && notif) {
        onAllPermissionsGranted();
      }
    } catch (e) {
      console.warn('⚠️ [PERMISSION CHECK] Error checking permissions:', e);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  const requestAllPermissions = async () => {
    try {
      setChecking(true);

      // 1. Request Foreground Location
      const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
      const fg = fgStatus === 'granted';
      setForegroundGranted(fg);

      if (!fg) {
        setChecking(false);
        return;
      }

      // 2. Request Background Location
      const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
      const bg = bgStatus === 'granted';
      setBackgroundGranted(bg);

      // 3. Request Notifications (Android 13+)
      let notif = true;
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Garuda A.S.T.R.A Terminal Active',
            message: 'Notification permission is required to keep the tactical background telemetry service visible in your status bar.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        notif = granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      setNotificationsGranted(notif);

      // Final check
      if (fg && bg && notif) {
        onAllPermissionsGranted();
      }
    } catch (err) {
      console.warn('⚠️ [PERMISSION REQUEST] Error requesting permissions:', err);
    } finally {
      setChecking(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Terminal Header */}
        <View style={styles.header}>
          <View style={styles.logoWrapper}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.logo}
            />
            <View style={styles.pulseContainer}>
              <PulseIndicator color={COLORS.error} size={84} pulseSize={1.5} duration={1800} />
            </View>
          </View>
          <Text style={styles.terminalTitle}>GARUDA TERMINAL GUARD</Text>
          <Text style={styles.terminalSubtitle}>SECURE BOOT SEQUENCER</Text>
        </View>

        {/* Informational Message */}
        <View style={styles.alertBox}>
          <MaterialIcons name="security" size={20} color={COLORS.primary} style={{ marginRight: 10 }} />
          <Text style={styles.alertText}>
            Terminal authorization required. System policies strictly require active tactical telemetry and notification streams before terminal access.
          </Text>
        </View>

        {/* Permissions List */}
        <View style={styles.listContainer}>
          {/* Permission 1: Foreground GPS */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="gps-fixed" size={24} color={COLORS.primary} />
              <View style={styles.cardTitleBox}>
                <Text style={styles.cardTitle}>TACTICAL FOREGROUND GPS</Text>
                <Text style={styles.cardDesc}>Enables real-time radar mapping and visual scanning overlays.</Text>
              </View>
              <View style={[styles.statusBadge, foregroundGranted ? styles.badgeGreen : styles.badgeRed]}>
                <Text style={[styles.badgeText, { color: foregroundGranted ? COLORS.secondary : COLORS.error }]}>
                  {foregroundGranted ? 'AUTHORIZED' : 'LOCKED'}
                </Text>
              </View>
            </View>
          </View>

          {/* Permission 2: Background Telemetry */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="sync" size={24} color={COLORS.primary} />
              <View style={styles.cardTitleBox}>
                <Text style={styles.cardTitle}>HQ BACKUP TELEMETRY</Text>
                <Text style={styles.cardDesc}>Ensures continuous background stream telemetry when app is minimized.</Text>
              </View>
              <View style={[styles.statusBadge, backgroundGranted ? styles.badgeGreen : styles.badgeRed]}>
                <Text style={[styles.badgeText, { color: backgroundGranted ? COLORS.secondary : COLORS.error }]}>
                  {backgroundGranted ? 'AUTHORIZED' : 'LOCKED'}
                </Text>
              </View>
            </View>
          </View>

          {/* Permission 3: Notification Dispatch */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="notifications-active" size={24} color={COLORS.primary} />
              <View style={styles.cardTitleBox}>
                <Text style={styles.cardTitle}>HQ COMMS DISPATCH</Text>
                <Text style={styles.cardDesc}>Allows critical threat notifications and status displays in system bar.</Text>
              </View>
              <View style={[styles.statusBadge, notificationsGranted ? styles.badgeGreen : styles.badgeRed]}>
                <Text style={[styles.badgeText, { color: notificationsGranted ? COLORS.secondary : COLORS.error }]}>
                  {notificationsGranted ? 'AUTHORIZED' : 'LOCKED'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Unlock Action Button */}
        <TouchableOpacity
          style={[styles.actionButton, checking && styles.buttonDisabled]}
          onPress={requestAllPermissions}
          disabled={checking}
        >
          <MaterialIcons name="lock-open" size={20} color={COLORS.background} style={{ marginRight: 8 }} />
          <Text style={styles.actionButtonText}>
            {checking ? 'SYNCHRONIZING...' : 'AUTHORIZE TACTICAL BOOT'}
          </Text>
        </TouchableOpacity>

        {/* Footer info */}
        <Text style={styles.footerText}>
          SECURE ENCRYPTED COMMS • PORT 92901 • HQ-VERIFIED
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.gutter,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginVertical: 24,
  },
  logoWrapper: {
    width: 96,
    height: 96,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 64,
    height: 64,
    resizeMode: 'contain',
    zIndex: 10,
  },
  pulseContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  terminalTitle: {
    ...TYPOGRAPHY.headlineSm,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 2,
  },
  terminalSubtitle: {
    ...TYPOGRAPHY.labelCaps,
    color: COLORS.onSurfaceVariant,
    fontSize: 10,
    letterSpacing: 3,
    marginTop: 4,
  },
  alertBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(246, 190, 57, 0.08)',
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: ROUNDED.DEFAULT,
    padding: 16,
    width: '100%',
    marginBottom: 24,
  },
  alertText: {
    ...TYPOGRAPHY.bodyLg,
    fontSize: 12,
    color: COLORS.onSurface,
    lineHeight: 18,
    flex: 1,
  },
  listContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 28,
  },
  card: {
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: ROUNDED.DEFAULT,
    padding: 16,
    width: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitleBox: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  cardTitle: {
    ...TYPOGRAPHY.labelCaps,
    color: COLORS.onSurface,
    fontSize: 11,
    fontWeight: '800',
  },
  cardDesc: {
    ...TYPOGRAPHY.bodyLg,
    fontSize: 10,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
    lineHeight: 14,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: ROUNDED.sm,
    borderWidth: 1,
    minWidth: 90,
    alignItems: 'center',
  },
  badgeGreen: {
    backgroundColor: 'rgba(24, 154, 114, 0.12)',
    borderColor: COLORS.secondary,
  },
  badgeRed: {
    backgroundColor: 'rgba(239, 83, 80, 0.12)',
    borderColor: COLORS.error,
  },
  badgeText: {
    ...TYPOGRAPHY.dataMono,
    fontSize: 9,
    fontWeight: '800',
  },
  actionButton: {
    width: '100%',
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: ROUNDED.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: COLORS.surfaceHigh,
    opacity: 0.5,
  },
  actionButtonText: {
    ...TYPOGRAPHY.labelCaps,
    color: COLORS.background,
    fontSize: 12,
    fontWeight: '900',
  },
  footerText: {
    ...TYPOGRAPHY.dataMono,
    fontSize: 9,
    color: COLORS.onSurfaceVariant,
    opacity: 0.6,
    marginTop: 24,
    marginBottom: 12,
  },
});
