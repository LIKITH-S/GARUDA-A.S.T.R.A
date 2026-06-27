import React, { useState, useEffect } from 'react';
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
import { AlertItem } from '../utils/mockState';
import ScanLine from '../components/ScanLine';
import PulseIndicator from '../components/PulseIndicator';
import TacticalCard from '../components/TacticalCard';
import { getBestEffortPosition } from '../services/gpsService';

interface AlertsScreenProps {
  alerts: AlertItem[];
  onSelectAlert: (alert: AlertItem) => void;
  onRespondAlert: (alertId: string) => void;
  onSosTrigger: () => void;
}

export const AlertsScreen: React.FC<AlertsScreenProps> = ({
  alerts,
  onSelectAlert,
  onRespondAlert,
  onSosTrigger,
}) => {
  const [geoLoc, setGeoLoc] = useState<string>('12.3007° N, 76.5986° E');

  useEffect(() => {
    let isMounted = true;
    const updateLoc = async () => {
      try {
        const pos = await getBestEffortPosition();
        if (isMounted) {
          const latDirection = pos.latitude >= 0 ? 'N' : 'S';
          const lonDirection = pos.longitude >= 0 ? 'E' : 'W';
          setGeoLoc(
            `${Math.abs(pos.latitude).toFixed(4)}° ${latDirection}, ${Math.abs(pos.longitude).toFixed(4)}° ${lonDirection}`
          );
        }
      } catch {
        // Silently handle
      }
    };

    updateLoc();
    const interval = setInterval(updateLoc, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <MaterialIcons name="shield" size={24} color={COLORS.primary} style={{ marginRight: 8 }} />
          <Text style={styles.headerTitle}>PATROL UNIT-042</Text>
        </View>
        <View style={styles.headerRight}>
          <MaterialIcons name="signal-cellular-alt" size={20} color={COLORS.primary} style={{ marginRight: 4 }} />
          <PulseIndicator color={COLORS.primary} size={8} pulseSize={2.5} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Live Status Bar */}
        <View style={styles.statusBar}>
          <View style={styles.statusInfo}>
            <Text style={styles.statusLabel}>SYSTEM STATUS</Text>
            <Text style={styles.statusValue} numberOfLines={1} adjustsFontSizeToFit>
              ACTIVE SCANNING [24.4 FPS]
            </Text>
          </View>
          <View style={styles.geoLocContainer}>
            <Text style={styles.geoLabel}>GEO-LOC</Text>
            <Text style={styles.geoValue} numberOfLines={1} adjustsFontSizeToFit>
              {geoLoc}
            </Text>
          </View>
        </View>

        {/* Alerts Feed */}
        {alerts.map((alert) => {
          const hasImage = !!alert.mugshotUrl;
          const accentColor =
            alert.status === 'ALERT'
              ? alert.threatLevel === 'HIGH'
                ? COLORS.primary
                : COLORS.secondary
              : COLORS.outlineVariant;

          return (
            <TacticalCard
              key={alert.id}
              accentColor={accentColor}
              containerStyle={styles.cardContainer}
            >
              <View style={styles.cardPadding}>
                {/* Header */}
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.cardSubtitle,
                        { color: alert.status === 'ALERT' ? accentColor : COLORS.outline },
                      ]}
                    >
                      {alert.subtitle}
                      {alert.status !== 'ALERT' && ` (${alert.status})`}
                    </Text>
                    <Text style={styles.cardTitle}>{alert.title}</Text>
                  </View>

                  {alert.matchPercentage && (
                    <View style={styles.matchBadge}>
                      <Text style={styles.matchText}>
                        {alert.matchPercentage}% MATCH
                      </Text>
                    </View>
                  )}
                </View>

                {/* Details Section */}
                <View style={styles.gridRow}>
                  {/* Mugshot with Scanner */}
                  <View style={styles.mugshotWrapper}>
                    {hasImage ? (
                      <Image source={{ uri: alert.mugshotUrl }} style={styles.mugshot} />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <MaterialIcons name="person" size={48} color={COLORS.outline} />
                      </View>
                    )}
                    {alert.status === 'ALERT' && (
                      <ScanLine color={COLORS.secondary} duration={2500} />
                    )}
                    <View style={styles.mugshotBadge}>
                      <MaterialIcons name="gps-fixed" size={10} color={COLORS.onSurface} style={{ marginRight: 4 }} />
                      <Text style={styles.mugshotBadgeText}>FACE ID VERIFIED</Text>
                    </View>
                  </View>

                  {/* Meta info */}
                  <View style={styles.infoCol}>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>LAST SEEN LOCATION</Text>
                      <Text style={styles.metaValue}>
                        <MaterialIcons name="place" size={14} color={COLORS.primary} /> {alert.lastSeenLocation}
                      </Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>THREAT LEVEL</Text>
                      <Text
                        style={[
                          styles.metaValue,
                          {
                            color:
                              alert.threatLevel === 'HIGH'
                                ? COLORS.error
                                : COLORS.onSurface,
                          },
                        ]}
                      >
                        <MaterialIcons
                          name="warning"
                          size={14}
                          color={alert.threatLevel === 'HIGH' ? COLORS.error : COLORS.onSurface}
                        /> {alert.threatLevel}
                      </Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>FILE NO.</Text>
                      <Text style={styles.metaValueMono}>{alert.fileNo}</Text>
                    </View>
                  </View>
                </View>

                {/* Unified Action Buttons — every alert gets both */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    onPress={() => onRespondAlert(alert.id)}
                    style={[
                      styles.actionButton,
                      styles.actionButtonPrimary,
                      alert.status !== 'ALERT' && styles.actionButtonDisabled,
                    ]}
                    disabled={alert.status !== 'ALERT'}
                  >
                    <MaterialIcons
                      name="notifications-active"
                      size={16}
                      color={alert.status === 'ALERT' ? COLORS.onPrimary : COLORS.outline}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={[styles.actionButtonText, { color: alert.status === 'ALERT' ? COLORS.onPrimary : COLORS.outline }]}>
                      RESPOND
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => onSelectAlert(alert)}
                    style={[styles.actionButton, styles.actionButtonSecondary]}
                  >
                    <MaterialIcons name="info" size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
                    <Text style={[styles.actionButtonText, { color: COLORS.primary }]}>
                      DETAILS
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Assigned Officer Info Strip */}
                {alert.assignments && alert.assignments.length > 0 ? (
                  <View style={styles.officerStrip}>
                    <View style={{ flexDirection: 'column', gap: 8, flex: 1 }}>
                      {alert.assignments.map((assignment, idx) => (
                        <View key={idx} style={styles.officerStripLeft}>
                          <View style={styles.officerAvatar}>
                            <MaterialIcons name="local-police" size={14} color={COLORS.primary} />
                          </View>
                          <View>
                            <Text style={styles.officerName}>
                              {assignment.officer?.user?.full_name || 'Unknown Officer'}
                            </Text>
                            <Text style={styles.officerMeta}>
                              {assignment.officer?.badge_number ? `Badge: ${assignment.officer.badge_number}` : 'No Badge'}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                    <View style={[
                      styles.statusChip,
                      {
                        backgroundColor: alert.status === 'ALERT'
                          ? 'rgba(246, 190, 57, 0.12)'
                          : alert.status === 'COMPLETED'
                            ? 'rgba(76, 215, 246, 0.12)'
                            : 'rgba(155, 143, 122, 0.12)',
                        borderColor: alert.status === 'ALERT'
                          ? COLORS.primary
                          : alert.status === 'COMPLETED'
                            ? COLORS.secondary
                            : COLORS.outline,
                      },
                    ]}>
                      <View style={[
                        styles.statusDot,
                        {
                          backgroundColor: alert.status === 'ALERT'
                            ? COLORS.primary
                            : alert.status === 'COMPLETED'
                              ? COLORS.secondary
                              : COLORS.outline,
                        },
                      ]} />
                      <Text style={[
                        styles.statusChipText,
                        {
                          color: alert.status === 'ALERT'
                            ? COLORS.primary
                            : alert.status === 'COMPLETED'
                              ? COLORS.secondary
                              : COLORS.outline,
                        },
                      ]}>{alert.status}</Text>
                    </View>
                  </View>
                ) : (
                  <View style={[styles.officerStrip, { backgroundColor: 'rgba(246, 70, 70, 0.05)', borderColor: COLORS.error }]}>
                    <View style={styles.officerStripLeft}>
                      <MaterialIcons name="warning" size={18} color={COLORS.error} />
                      <Text style={[styles.officerName, { color: COLORS.error, marginLeft: 8 }]}>NOT ASSIGNED TO ANYONE</Text>
                    </View>
                  </View>
                )}
              </View>
            </TacticalCard>
          );
        })}
      </ScrollView>

      {/* Floating SOS FAB */}
      <TouchableOpacity
        onPress={onSosTrigger}
        style={styles.sosFab}
        activeOpacity={0.8}
      >
        <PulseIndicator color={COLORS.error} size={56} pulseSize={1.6} duration={1500} />
        <Text style={styles.sosText}>SOS</Text>
      </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  signalIcon: {
    fontSize: 18,
    color: COLORS.primary,
  },
  scrollContent: {
    padding: SPACING.gutter,
    paddingBottom: 120,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: ROUNDED.DEFAULT,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    marginBottom: 16,
  },
  statusInfo: {
    flex: 1.1,
    marginRight: 4,
  },
  statusLabel: {
    ...TYPOGRAPHY.labelCaps,
    color: COLORS.primary,
    opacity: 0.7,
    fontSize: 10,
  },
  statusValue: {
    ...TYPOGRAPHY.dataMono,
    color: COLORS.secondary,
    marginTop: 2,
    fontSize: 12,
  },
  geoLocContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  geoLabel: {
    ...TYPOGRAPHY.labelCaps,
    color: COLORS.onSurfaceVariant,
    fontSize: 10,
  },
  geoValue: {
    ...TYPOGRAPHY.dataMono,
    color: COLORS.onSurface,
    marginTop: 2,
    fontSize: 12,
  },
  cardContainer: {
    marginBottom: 16,
  },
  cardPadding: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardSubtitle: {
    ...TYPOGRAPHY.labelCaps,
  },
  cardTitle: {
    ...TYPOGRAPHY.headlineSm,
    color: COLORS.onSurface,
    marginTop: 2,
  },
  matchBadge: {
    backgroundColor: 'rgba(246, 190, 57, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(246, 190, 57, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: ROUNDED.sm,
  },
  matchText: {
    ...TYPOGRAPHY.dataMono,
    color: COLORS.primary,
    fontWeight: '700',
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  mugshotWrapper: {
    position: 'relative',
    width: 120,
    height: 140,
    borderRadius: ROUNDED.DEFAULT,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceLow,
  },
  mugshot: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  mugshotBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(23, 19, 10, 0.8)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: ROUNDED.sm,
  },
  mugshotBadgeIcon: {
    fontSize: 10,
    marginRight: 4,
  },
  mugshotBadgeText: {
    fontSize: 8,
    color: COLORS.onSurface,
    fontWeight: '700',
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  metaRow: {
    marginBottom: 8,
  },
  metaLabel: {
    ...TYPOGRAPHY.labelCaps,
    fontSize: 9,
    color: COLORS.onSurfaceVariant,
    lineHeight: 12,
  },
  metaValue: {
    ...TYPOGRAPHY.bodyLg,
    fontSize: 14,
    color: COLORS.onSurface,
    fontWeight: '600',
    marginTop: 2,
  },
  metaValueMono: {
    ...TYPOGRAPHY.dataMono,
    color: COLORS.onSurface,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    height: 48,
    borderRadius: ROUNDED.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonPrimary: {
    backgroundColor: COLORS.primaryContainer,
  },
  actionButtonDisabled: {
    backgroundColor: COLORS.surfaceHigh,
    opacity: 0.5,
  },
  actionButtonSecondary: {
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  actionButtonText: {
    ...TYPOGRAPHY.labelCaps,
    fontSize: 11,
    color: COLORS.onSurface,
    fontWeight: '700',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceVariant,
  },
  sosFab: {
    position: 'absolute',
    bottom: 88,
    right: SPACING.gutter,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.errorContainer,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.errorContainer,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 100,
  },
  sosText: {
    position: 'absolute',
    ...TYPOGRAPHY.labelCaps,
    color: COLORS.onErrorContainer,
    fontSize: 12,
    fontWeight: '800',
    zIndex: 10,
  },
  officerStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
  },
  officerStripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  officerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(246, 190, 57, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  officerName: {
    ...TYPOGRAPHY.labelCaps,
    fontSize: 10,
    color: COLORS.onSurface,
    fontWeight: '700',
  },
  officerMeta: {
    ...TYPOGRAPHY.dataMono,
    fontSize: 8,
    color: COLORS.onSurfaceVariant,
    marginTop: 1,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: ROUNDED.full,
    borderWidth: 1,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 5,
  },
  statusChipText: {
    ...TYPOGRAPHY.labelCaps,
    fontSize: 8,
    fontWeight: '700',
  },
});
export default AlertsScreen;
