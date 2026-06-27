import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, ROUNDED } from '../constants/theme';
import { AlertItem } from '../utils/mockState';
import ScanLine from '../components/ScanLine';
import PulseIndicator from '../components/PulseIndicator';
import TacticalCard from '../components/TacticalCard';

interface AlertDetailsScreenProps {
  alert: AlertItem;
  onBack: () => void;
  onUpdateStatus: (alertId: string, status: AlertItem['status']) => void;
}

export const AlertDetailsScreen: React.FC<AlertDetailsScreenProps> = ({
  alert,
  onBack,
  onUpdateStatus,
}) => {
  const [currentStatus, setCurrentStatus] = useState<AlertItem['status']>(alert.status);

  const handleStatusChange = (status: AlertItem['status']) => {
    setCurrentStatus(status);
    onUpdateStatus(alert.id, status);
    
    Alert.alert(
      'TELEMETRY LOGGED',
      `Unit-042 field report successfully transmitted to command server:\nSTATUS: ${status}`,
      [{ text: 'ACKNOWLEDGE', style: 'default' }],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="keyboard-arrow-left" size={22} color={COLORS.primary} />
          <Text style={styles.backText}>BACK</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PATROL UNIT-042</Text>
        <View style={styles.headerRight}>
          <PulseIndicator color={COLORS.secondary} size={8} pulseSize={2.5} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Title Block */}
        <View style={styles.titleBlock}>
          <View style={styles.titleRow}>
            <MaterialIcons name="warning" size={24} color={COLORS.primary} style={{ marginRight: 4 }} />
            <Text style={styles.titleText}>CRITICAL ALERT</Text>
          </View>
          <View style={styles.monitoringBadge}>
            <View style={styles.monitoringDot} />
            <Text style={styles.monitoringText}>ACTIVE MONITORING</Text>
          </View>
        </View>

        {/* Subject Image */}
        <View style={styles.feedsGrid}>
          <TacticalCard containerStyle={styles.feedCard}>
            <View style={styles.feedHeader}>
              <Text style={styles.feedLabelPrimary}>SUBJECT DATABASE MATCH</Text>
              <Text style={styles.feedValue}>REC: {alert.fileNo}</Text>
            </View>
            <View style={styles.feedImageWrapper}>
              <Image
                source={{
                  uri: alert.mugshotUrl || 'https://via.placeholder.com/150',
                }}
                style={styles.feedImageColor}
              />
              {currentStatus === 'ALERT' && (
                <ScanLine color={COLORS.secondary} duration={3000} />
              )}
              {alert.confidence || alert.matchPercentage ? (
                <View style={styles.confidenceBadge}>
                  <Text style={styles.confidenceNumber}>
                    {alert.confidence || `${alert.matchPercentage}%`}
                  </Text>
                  <Text style={styles.confidenceLabel}>CONFIDENCE</Text>
                </View>
              ) : null}
            </View>
          </TacticalCard>
        </View>

        {/* Telemetry metadata */}
        <View style={styles.metaRow}>
          <TacticalCard
            accentColor={COLORS.primary}
            containerStyle={styles.mainMetaCard}
          >
            <View style={styles.cardPadding}>
              <View style={styles.metaHeader}>
                <View>
                  <Text style={styles.metaTitle}>{alert.title}</Text>
                  <Text style={styles.metaWarrant}>
                    Warrant Status:{' '}
                    <Text style={styles.warrantOutstanding}>OUTSTANDING</Text>
                  </Text>
                </View>
                <View style={styles.timeContainer}>
                  <Text style={styles.timeLabel}>LAST SEEN</Text>
                  <Text style={styles.timeValue}>{alert.lastSeenTime}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.metaDetailsGrid}>
                <View style={styles.metaDetailItem}>
                  <Text style={styles.metaDetailLabel}>PRIMARY LOCATION</Text>
                  <Text style={styles.metaDetailValue}>
                    <MaterialIcons name="place" size={14} color={COLORS.primary} /> {alert.lastSeenLocation}
                  </Text>
                </View>
                <View style={styles.metaDetailItem}>
                  <Text style={styles.metaDetailLabel}>THREAT LEVEL</Text>
                  <View style={styles.threatBarWrapper}>
                    <View style={[styles.threatSegment, styles.threatSegmentActive]} />
                    <View style={[styles.threatSegment, styles.threatSegmentActive]} />
                    <View style={[styles.threatSegment, styles.threatSegmentActive]} />
                    <View style={styles.threatSegment} />
                    <Text style={styles.threatText}>HIGH</Text>
                  </View>
                </View>
              </View>
            </View>
          </TacticalCard>

          <TacticalCard containerStyle={styles.cameraTelemetryCard}>
            <View style={styles.cardPadding}>
              <Text style={styles.telemetryLabel}>CAMERA TELEMETRY</Text>
              {alert.telemetry ? (
                <View style={styles.telemetryGrid}>
                  <View style={styles.telemetryRow}>
                    <Text style={styles.telemetryKey}>AZIMUTH</Text>
                    <Text style={styles.telemetryVal}>{alert.telemetry.azimuth}</Text>
                  </View>
                  <View style={styles.telemetryRow}>
                    <Text style={styles.telemetryKey}>ZOOM</Text>
                    <Text style={styles.telemetryVal}>{alert.telemetry.zoom}</Text>
                  </View>
                  <View style={styles.telemetryRow}>
                    <Text style={styles.telemetryKey}>LENS</Text>
                    <Text style={styles.telemetryVal}>{alert.telemetry.lens}</Text>
                  </View>
                  <View style={styles.telemetryRow}>
                    <Text style={styles.telemetryKey}>SIGNAL</Text>
                    <Text style={styles.telemetryVal}>{alert.telemetry.signal}</Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.telemetryEmpty}>No direct camera telemetry active.</Text>
              )}
            </View>
          </TacticalCard>
        </View>

        {/* Operational Field Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.actionsTitle}>OPERATIONAL FIELD CONTROLS</Text>
            <TouchableOpacity
              onPress={() => handleStatusChange('EN-ROUTE')}
              style={[
                styles.actionButton,
                currentStatus === 'EN-ROUTE'
                  ? styles.btnEnRouteActive
                  : styles.btnEnRoute,
              ]}
            >
              <MaterialIcons
                name="directions-car"
                size={18}
                color={currentStatus === 'EN-ROUTE' ? COLORS.primary : COLORS.onSurfaceVariant}
              />
              <Text
                style={[
                  styles.actionBtnLabel,
                  { color: currentStatus === 'EN-ROUTE' ? COLORS.primary : COLORS.onSurfaceVariant }
                ]}
              >
                EN-ROUTE
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleStatusChange('INVESTIGATING')}
              style={[
                styles.actionButton,
                currentStatus === 'INVESTIGATING'
                  ? styles.btnInvestigatingActive
                  : styles.btnInvestigating,
              ]}
            >
              <MaterialIcons
                name="search"
                size={18}
                color={currentStatus === 'INVESTIGATING' ? COLORS.primary : COLORS.onSurfaceVariant}
              />
              <Text
                style={[
                  styles.actionBtnLabel,
                  { color: currentStatus === 'INVESTIGATING' ? COLORS.primary : COLORS.onSurfaceVariant }
                ]}
              >
                INVESTIGATING
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleStatusChange('FALSE ALARM')}
              style={[
                styles.actionButton,
                currentStatus === 'FALSE ALARM'
                  ? styles.btnFalseActive
                  : styles.btnFalse,
              ]}
            >
              <MaterialIcons
                name="cancel"
                size={18}
                color={currentStatus === 'FALSE ALARM' ? COLORS.onSurface : COLORS.onSurfaceVariant}
              />
              <Text
                style={[
                  styles.actionBtnLabel,
                  { color: currentStatus === 'FALSE ALARM' ? COLORS.onSurface : COLORS.onSurfaceVariant }
                ]}
              >
                FALSE ALARM
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleStatusChange('TARGET LOST')}
              style={[
                styles.actionButton,
                currentStatus === 'TARGET LOST'
                  ? styles.btnLostActive
                  : styles.btnLost,
              ]}
            >
              <MaterialIcons
                name="directions-run"
                size={18}
                color={currentStatus === 'TARGET LOST' ? COLORS.error : COLORS.onSurfaceVariant}
              />
              <Text
                style={[
                  styles.actionBtnLabel,
                  { color: currentStatus === 'TARGET LOST' ? COLORS.error : COLORS.onSurfaceVariant }
                ]}
              >
                TARGET LOST
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleStatusChange('FOUND')}
              style={[
                styles.actionButton,
                { width: '100%' },
                currentStatus === 'FOUND'
                  ? styles.btnCompleteActive
                  : styles.btnComplete,
              ]}
            >
              <MaterialIcons
                name="check-circle"
                size={18}
                color={currentStatus === 'FOUND' ? COLORS.onSecondary : COLORS.secondary}
              />
              <Text
                style={[
                  styles.actionBtnLabel,
                  { color: currentStatus === 'FOUND' ? COLORS.onSecondary : COLORS.secondary }
                ]}
              >
                FOUND
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backIcon: {
    fontSize: 12,
    color: COLORS.primary,
  },
  backText: {
    ...TYPOGRAPHY.labelCaps,
    color: COLORS.primary,
  },
  headerTitle: {
    ...TYPOGRAPHY.headlineSmMobile,
    color: COLORS.onSurface,
    fontWeight: '700',
  },
  headerRight: {
    width: 48,
    alignItems: 'flex-end',
  },
  scrollContent: {
    padding: SPACING.gutter,
    paddingBottom: 48,
  },
  titleBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertIcon: {
    fontSize: 20,
  },
  titleText: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.primary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  monitoringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  monitoringDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.onPrimaryContainer,
    marginRight: 6,
  },
  monitoringText: {
    ...TYPOGRAPHY.labelCaps,
    fontSize: 9,
    color: COLORS.onPrimaryContainer,
  },
  feedsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  feedCard: {
    flex: 1,
  },
  feedHeader: {
    backgroundColor: COLORS.surfaceHigh,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  feedLabel: {
    ...TYPOGRAPHY.labelCaps,
    fontSize: 9,
    color: COLORS.secondary,
  },
  feedLabelPrimary: {
    ...TYPOGRAPHY.labelCaps,
    fontSize: 9,
    color: COLORS.primary,
  },
  feedValue: {
    ...TYPOGRAPHY.dataMono,
    fontSize: 10,
    color: COLORS.onSurfaceVariant,
  },
  feedImageWrapper: {
    position: 'relative',
    aspectRatio: 1,
    backgroundColor: COLORS.surfaceLow,
  },
  feedImageGray: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    opacity: 0.8,
  },
  feedImageColor: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  confidenceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: ROUNDED.DEFAULT,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    alignItems: 'center',
  },
  confidenceNumber: {
    ...TYPOGRAPHY.headlineSm,
    color: COLORS.onPrimary,
    fontWeight: '800',
    lineHeight: 20,
  },
  confidenceLabel: {
    ...TYPOGRAPHY.labelCaps,
    fontSize: 7,
    color: COLORS.onPrimary,
    lineHeight: 8,
    marginTop: -2,
  },
  metaRow: {
    flexDirection: 'column',
    gap: 16,
    marginBottom: 24,
  },
  mainMetaCard: {
    width: '100%',
  },
  cardPadding: {
    padding: 16,
  },
  metaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  metaTitle: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.primary,
    fontWeight: '700',
  },
  metaWarrant: {
    ...TYPOGRAPHY.dataMono,
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    marginTop: 4,
  },
  warrantOutstanding: {
    color: COLORS.error,
    fontWeight: '700',
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  timeLabel: {
    ...TYPOGRAPHY.labelCaps,
    color: COLORS.outline,
    fontSize: 9,
  },
  timeValue: {
    ...TYPOGRAPHY.bodyMd,
    fontWeight: '600',
    color: COLORS.onSurface,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.outlineVariant,
    marginVertical: 16,
  },
  metaDetailsGrid: {
    flexDirection: 'row',
    gap: 24,
  },
  metaDetailItem: {
    flex: 1,
  },
  metaDetailLabel: {
    ...TYPOGRAPHY.labelCaps,
    color: COLORS.onSurfaceVariant,
    fontSize: 10,
    marginBottom: 4,
  },
  metaDetailValue: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurface,
    fontWeight: '600',
  },
  threatBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  threatSegment: {
    width: 24,
    height: 6,
    backgroundColor: COLORS.outlineVariant,
    borderRadius: 3,
  },
  threatSegmentActive: {
    backgroundColor: COLORS.primary,
  },
  threatText: {
    ...TYPOGRAPHY.dataMono,
    color: COLORS.primary,
    fontSize: 11,
    marginLeft: 6,
    fontWeight: '700',
  },
  cameraTelemetryCard: {
    width: '100%',
  },
  telemetryLabel: {
    ...TYPOGRAPHY.labelCaps,
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
    marginBottom: 12,
  },
  telemetryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  telemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '47%',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(79, 70, 52, 0.2)',
    paddingBottom: 6,
  },
  telemetryKey: {
    ...TYPOGRAPHY.dataMono,
    color: COLORS.outline,
    fontSize: 11,
  },
  telemetryVal: {
    ...TYPOGRAPHY.dataMono,
    color: COLORS.secondary,
    fontWeight: '700',
    fontSize: 11,
  },
  telemetryEmpty: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.outline,
    fontStyle: 'italic',
  },
  actionsContainer: {
    marginTop: 12,
  },
  actionsTitle: {
    ...TYPOGRAPHY.labelCaps,
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
    marginBottom: 16,
    paddingLeft: 4,
  },
  buttonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: '47%',
    height: 64,
    borderRadius: ROUNDED.DEFAULT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 10,
    borderWidth: 1,
  },
  actionIcon: {
    fontSize: 18,
  },
  actionBtnLabel: {
    ...TYPOGRAPHY.labelCaps,
    fontSize: 9,
    fontWeight: '700',
  },
  btnInvestigating: {
    backgroundColor: COLORS.surfaceContainer,
    borderColor: 'rgba(246, 190, 57, 0.4)',
  },
  btnInvestigatingActive: {
    backgroundColor: 'rgba(246, 190, 57, 0.2)',
    borderColor: COLORS.primary,
  },
  btnLocated: {
    backgroundColor: COLORS.surfaceContainer,
    borderColor: COLORS.primary,
  },
  btnLocatedActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  btnFalse: {
    backgroundColor: COLORS.surfaceContainer,
    borderColor: COLORS.outlineVariant,
  },
  btnFalseActive: {
    backgroundColor: COLORS.surfaceHigh,
    borderColor: COLORS.outline,
  },
  btnEnRoute: {
    backgroundColor: COLORS.surfaceContainer,
    borderColor: 'rgba(57, 190, 246, 0.4)',
  },
  btnEnRouteActive: {
    backgroundColor: 'rgba(57, 190, 246, 0.2)',
    borderColor: COLORS.primary,
  },
  btnLost: {
    backgroundColor: COLORS.surfaceContainer,
    borderColor: 'rgba(246, 57, 57, 0.4)',
  },
  btnLostActive: {
    backgroundColor: 'rgba(246, 57, 57, 0.2)',
    borderColor: COLORS.error,
  },
  btnComplete: {
    backgroundColor: COLORS.surfaceContainer,
    borderColor: COLORS.secondaryContainer,
  },
  btnCompleteActive: {
    backgroundColor: COLORS.secondaryContainer,
    borderColor: COLORS.secondaryContainer,
  },
});
export default AlertDetailsScreen;
