import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, ROUNDED } from '../constants/theme';
import { OfficerProfile } from '../utils/mockState';
import ScanLine from '../components/ScanLine';
import PulseIndicator from '../components/PulseIndicator';
import TacticalCard from '../components/TacticalCard';

interface ProfileScreenProps {
  officer: OfficerProfile;
  onLogout: () => void;
  onUpdateStatus: (status: string) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  officer,
  onLogout,
  onUpdateStatus,
}) => {
  const isOnDuty = officer.status === 'ACTIVE DUTY';

  const handleStatusToggle = () => {
    const nextStatus = isOnDuty ? 'STANDBY / STAND DOWN' : 'ACTIVE DUTY';
    onUpdateStatus(nextStatus);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <MaterialIcons name="security" size={24} color={COLORS.primary} style={{ marginRight: 8 }} />
          <Text style={styles.headerTitle}>OFFICER PROFILE</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.badgeText}>{officer.unitId}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Officer Identity Card */}
        <TacticalCard
          accentColor={isOnDuty ? COLORS.primary : COLORS.outlineVariant}
          containerStyle={styles.identityCard}
        >
          <View style={styles.cardPadding}>
            <ScanLine color={COLORS.secondary} duration={2800} />
            <View style={styles.identityRow}>
              {/* Portrait */}
              <View style={styles.portraitWrapper}>
                <Image
                  source={require('../../assets/icon.png')}
                  style={styles.portrait}
                />
                <View
                  style={[
                    styles.portraitDot,
                    { backgroundColor: isOnDuty ? COLORS.primary : COLORS.outline },
                  ]}
                />
              </View>

              {/* Title & Metadata */}
              <View style={styles.identityDetails}>
                <Text style={styles.officerName}>{officer.name}</Text>
                <Text style={styles.officerMeta}>
                  {officer.rank} • {officer.unitId}
                </Text>
                <Text style={styles.officerShift}>{officer.shift}</Text>
              </View>
            </View>
          </View>
        </TacticalCard>

        {/* Duty Status Interactive Button */}
        <TouchableOpacity
          onPress={handleStatusToggle}
          style={[styles.statusButton, !isOnDuty && styles.statusButtonStandby]}
          activeOpacity={0.8}
        >
          <View style={styles.statusButtonInner}>
            <View style={styles.statusRow}>
              <PulseIndicator
                color={isOnDuty ? COLORS.primary : COLORS.outline}
                size={12}
                pulseSize={2.5}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: isOnDuty ? COLORS.primary : COLORS.onSurfaceVariant },
                ]}
              >
                {isOnDuty ? 'ON DUTY / ACTIVE SCANNING' : 'OFF DUTY / STANDBY MODE'}
              </Text>
            </View>
            <Text style={styles.statusTapText}>TAP TO TOGGLE PATROL DUTY STATUS</Text>
          </View>
        </TouchableOpacity>

        {/* Performance Metrics Section */}
        <Text style={styles.sectionHeader}>PERFORMANCE METRICS</Text>

        <View style={styles.metricsGrid}>
          {/* Resolved Cases Card */}
          <TacticalCard accentColor={COLORS.secondary} containerStyle={styles.metricCard}>
            <View style={styles.metricPadding}>
              <View style={styles.metricHeaderRow}>
                <View>
                  <Text style={styles.metricLabel}>RESOLVED CASES</Text>
                  <Text style={styles.metricValueLarge}>142</Text>
                  <Text style={styles.metricLabelSub}>YTD Performance</Text>
                </View>
                <MaterialIcons name="assignment" size={20} color={COLORS.secondary} style={{ opacity: 0.6 }} />
              </View>
            </View>
          </TacticalCard>

          {/* Response Time Card */}
          <TacticalCard accentColor={COLORS.tertiary} containerStyle={styles.metricCard}>
            <View style={styles.metricPadding}>
              <View style={styles.metricHeaderRow}>
                <View>
                  <Text style={styles.metricLabel}>AVG RESPONSE TIME</Text>
                  <Text style={[styles.metricValueLarge, { color: COLORS.tertiary }]}>3:12</Text>
                  <Text style={styles.metricLabelSub}>Minutes / Seconds</Text>
                </View>
                <MaterialIcons name="timer" size={20} color={COLORS.tertiary} style={{ opacity: 0.6 }} />
              </View>
            </View>
          </TacticalCard>

          {/* Performance Index card */}
          <TacticalCard accentColor={COLORS.primary} containerStyle={styles.fullWidthCard}>
            <View style={styles.metricPadding}>
              <View style={styles.performanceHeaderRow}>
                <View style={styles.iconTextRow}>
                  <MaterialIcons name="trending-up" size={18} color={COLORS.primary} />
                  <Text style={styles.perfLabel}>WEEKLY PERFORMANCE INDEX</Text>
                </View>
                <Text style={styles.perfValue}>98.4%</Text>
              </View>
              {/* Progress bar */}
              <View style={styles.progressBarBg}>
                <View style={styles.progressBarFill} />
              </View>
            </View>
          </TacticalCard>
        </View>

        {/* Operational info */}
        <Text style={styles.sectionHeader}>OPERATIONAL TELEMETRY</Text>
        <TacticalCard containerStyle={styles.telemetryCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>ENCRYPTION KEY</Text>
              <Text style={styles.infoValueMono}>{officer.encryptionKey}</Text>
            </View>
            <View style={styles.dividerCol} />
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>COMMS SERVER LINK</Text>
              <Text style={styles.infoValueMono}>{officer.commsLink}</Text>
            </View>
          </View>

          <View style={styles.horizontalDivider} />

          <View style={styles.singleInfoRow}>
            <Text style={styles.infoTextLeft}>Application Version</Text>
            <Text style={styles.infoTextRight}>v2.4.1 [STABLE BUILD]</Text>
          </View>

          <View style={styles.horizontalDivider} />

          <View style={styles.singleInfoRow}>
            <Text style={styles.infoTextLeft}>System Connection</Text>
            <View style={styles.secureConnectionRow}>
              <Text style={styles.secureConnectionText}>SECURE PROTOCOL</Text>
              <View style={styles.secureConnectionDot} />
            </View>
          </View>
        </TacticalCard>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={onLogout}
          style={styles.logoutButton}
          activeOpacity={0.8}
        >
          <MaterialIcons name="logout" size={20} color={COLORS.onPrimary} />
          <Text style={styles.logoutButtonText}>LOGOUT SESSION</Text>
        </TouchableOpacity>

        <Text style={styles.sessionTimeoutText}>
          SECURE ENCRYPTED TERMINAL SESSION ACTIVE
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: SPACING.touchTargetMin + 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.gutter,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  headerTitle: {
    ...TYPOGRAPHY.headlineSmMobile,
    color: COLORS.primary,
    fontWeight: '700',
  },
  headerRight: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: ROUNDED.sm,
  },
  badgeText: {
    ...TYPOGRAPHY.dataMono,
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '700',
  },
  scrollContent: {
    padding: SPACING.gutter,
    paddingBottom: 48,
  },
  identityCard: {
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  cardPadding: {
    padding: 16,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    zIndex: 2,
  },
  portraitWrapper: {
    position: 'relative',
    width: 72,
    height: 72,
    borderRadius: ROUNDED.DEFAULT,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    overflow: 'hidden',
    backgroundColor: COLORS.surfaceLow,
  },
  portrait: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  portraitDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#17130a',
  },
  identityDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  officerName: {
    ...TYPOGRAPHY.headlineSm,
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 20,
  },
  officerMeta: {
    ...TYPOGRAPHY.dataMono,
    color: COLORS.secondary,
    fontSize: 11,
    marginTop: 2,
  },
  officerShift: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: 4,
  },
  statusButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(246, 190, 57, 0.05)',
    borderRadius: ROUNDED.lg,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  statusButtonStandby: {
    borderColor: COLORS.outlineVariant,
    backgroundColor: 'rgba(79, 70, 52, 0.05)',
  },
  statusButtonInner: {
    alignItems: 'center',
    width: '100%',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    ...TYPOGRAPHY.headlineSm,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  statusTapText: {
    ...TYPOGRAPHY.labelCaps,
    fontSize: 8,
    color: COLORS.outline,
    marginTop: 4,
    opacity: 0.7,
  },
  sectionHeader: {
    ...TYPOGRAPHY.labelCaps,
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
    marginBottom: 12,
    paddingLeft: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    width: '47%',
  },
  metricPadding: {
    padding: 14,
  },
  metricHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  metricLabel: {
    ...TYPOGRAPHY.labelCaps,
    fontSize: 8,
    color: COLORS.onSurfaceVariant,
  },
  metricValueLarge: {
    ...TYPOGRAPHY.headlineSm,
    fontSize: 28,
    color: COLORS.secondary,
    fontWeight: '800',
    marginVertical: 4,
  },
  metricLabelSub: {
    ...TYPOGRAPHY.labelCaps,
    fontSize: 8,
    color: COLORS.outline,
  },
  metricIcon: {
    fontSize: 18,
    opacity: 0.6,
  },
  fullWidthCard: {
    width: '100%',
  },
  performanceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  perfIcon: {
    fontSize: 16,
  },
  perfLabel: {
    ...TYPOGRAPHY.labelCaps,
    fontSize: 9,
    color: COLORS.onSurfaceVariant,
  },
  perfValue: {
    ...TYPOGRAPHY.dataMono,
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    width: '98%',
    backgroundColor: COLORS.primary,
  },
  telemetryCard: {
    width: '100%',
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    padding: 14,
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  infoLabel: {
    ...TYPOGRAPHY.labelCaps,
    fontSize: 8,
    color: COLORS.outline,
    lineHeight: 12,
  },
  infoValueMono: {
    ...TYPOGRAPHY.dataMono,
    color: COLORS.onSurface,
    fontSize: 12,
    marginTop: 2,
  },
  dividerCol: {
    width: 1,
    backgroundColor: COLORS.outlineVariant,
    marginHorizontal: 12,
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: COLORS.outlineVariant,
  },
  singleInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  infoTextLeft: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurface,
  },
  infoTextRight: {
    ...TYPOGRAPHY.dataMono,
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
  },
  secureConnectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  secureConnectionText: {
    ...TYPOGRAPHY.labelCaps,
    fontSize: 9,
    color: COLORS.secondary,
    fontWeight: '700',
  },
  secureConnectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.secondary,
  },
  logoutButton: {
    height: 56,
    borderRadius: ROUNDED.lg,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  logoutButtonText: {
    ...TYPOGRAPHY.headlineSm,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onPrimary,
    letterSpacing: 1,
  },
  logoutIcon: {
    fontSize: 20,
  },
  sessionTimeoutText: {
    ...TYPOGRAPHY.labelCaps,
    fontSize: 8,
    color: COLORS.outline,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
export default ProfileScreen;
