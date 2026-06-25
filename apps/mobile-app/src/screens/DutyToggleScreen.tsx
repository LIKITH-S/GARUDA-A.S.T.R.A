import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, ROUNDED } from '../constants/theme';
import ScanLine from '../components/ScanLine';
import PulseIndicator from '../components/PulseIndicator';

interface DutyToggleScreenProps {
  officerName: string;
  onAcknowledge: (status: string) => void;
}

export const DutyToggleScreen: React.FC<DutyToggleScreenProps> = ({ officerName, onAcknowledge }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <MaterialIcons name="security" size={24} color={COLORS.primary} style={{ marginRight: 8 }} />
            <Text style={styles.headerTitle}>DUTY CHECK</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.portraitWrapper}>
            <View style={styles.portraitBorder}>
              <ScanLine color={COLORS.secondary} duration={2500} />
              <Image source={require('../../assets/icon.png')} style={styles.portrait} />
            </View>
            <Text style={styles.portraitTitle}>Welcome, {officerName}</Text>
            <Text style={styles.portraitSubtitle}>Set your initial duty status to access the tactical terminal.</Text>
          </View>

          <TouchableOpacity
            onPress={() => onAcknowledge('ACTIVE DUTY')}
            style={styles.buttonActive}
          >
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <PulseIndicator color={COLORS.primary} size={10} pulseSize={3} />
              <Text style={styles.buttonTextActive}>GO ON DUTY</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onAcknowledge('STANDBY / STAND DOWN')}
            style={styles.buttonStandby}
          >
             <Text style={styles.buttonTextStandby}>PROCEED OFF-DUTY (STANDBY)</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerCopyright}>
            © 2026 GARUDA ASTRA | TACTICAL OPS COMMAND
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    height: SPACING.touchTargetMin + 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.gutter,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.headlineSmMobile,
    color: COLORS.primary,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.gutter,
  },
  portraitWrapper: {
    alignItems: 'center',
    marginBottom: 48,
  },
  portraitBorder: {
    position: 'relative',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    overflow: 'hidden',
    backgroundColor: COLORS.surfaceContainer,
    marginBottom: 16,
  },
  portrait: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  portraitTitle: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.onSurface,
    textAlign: 'center',
  },
  portraitSubtitle: {
    ...TYPOGRAPHY.bodyLg,
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 8,
  },
  buttonActive: {
    height: 56,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(246, 190, 57, 0.1)',
    borderRadius: ROUNDED.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  buttonTextActive: {
    ...TYPOGRAPHY.headlineSm,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 12,
  },
  buttonStandby: {
    height: 56,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: 'rgba(79, 70, 52, 0.05)',
    borderRadius: ROUNDED.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTextStandby: {
    ...TYPOGRAPHY.headlineSm,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(79, 70, 52, 0.2)',
  },
  footerCopyright: {
    ...TYPOGRAPHY.labelCaps,
    fontSize: 9,
    color: COLORS.outlineVariant,
  },
});
