import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, ROUNDED } from '../constants/theme';
import { AuditLogEntry } from '../utils/mockState';
import PulseIndicator from '../components/PulseIndicator';
import TacticalCard from '../components/TacticalCard';

interface LogsScreenProps {
  auditLogs: AuditLogEntry[];
}

// Helper to get visual config per status
const getStatusStyle = (status: string) => {
  switch (status) {
    case 'ALERT':
      return { color: COLORS.primary, icon: 'notifications-active' as const, bg: 'rgba(246, 190, 57, 0.12)' };
    case 'INVESTIGATING':
      return { color: COLORS.primary, icon: 'search' as const, bg: 'rgba(246, 190, 57, 0.12)' };
    case 'LOCATED':
      return { color: COLORS.secondary, icon: 'gps-fixed' as const, bg: 'rgba(76, 215, 246, 0.12)' };
    case 'COMPLETED':
      return { color: COLORS.secondary, icon: 'check-circle' as const, bg: 'rgba(76, 215, 246, 0.12)' };
    case 'FALSE ALERT':
      return { color: COLORS.outline, icon: 'cancel' as const, bg: 'rgba(155, 143, 122, 0.12)' };
    default:
      return { color: COLORS.onSurfaceVariant, icon: 'fiber-new' as const, bg: 'rgba(155, 143, 122, 0.12)' };
  }
};

export const LogsScreen: React.FC<LogsScreenProps> = ({ auditLogs }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top App Bar */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <MaterialIcons name="history" size={22} color={COLORS.primary} style={{ marginRight: 8 }} />
          <Text style={styles.headerTitle}>AUDIT TRAIL</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.logCountBadge}>{auditLogs.length} ENTRIES</Text>
          <PulseIndicator color={COLORS.primary} size={8} pulseSize={2.5} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Section Label */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>STATUS CHANGE HISTORY</Text>
          <Text style={styles.sectionMeta}>READ-ONLY</Text>
        </View>

        {/* Timeline */}
        <View style={styles.timeline}>
          {auditLogs.map((log, index) => {
            const fromStyle = getStatusStyle(log.previousStatus);
            const toStyle = getStatusStyle(log.newStatus);
            const isLast = index === auditLogs.length - 1;

            return (
              <View key={log.id} style={styles.timelineEntry}>
                {/* Timeline dot + line */}
                <View style={styles.timelineTrack}>
                  <View style={[styles.timelineDot, { backgroundColor: toStyle.color }]} />
                  {!isLast && <View style={styles.timelineLine} />}
                </View>

                {/* Card */}
                <View style={styles.logCardWrapper}>
                  <TacticalCard
                    accentColor={toStyle.color}
                    style={styles.cardPadding}
                  >
                    {/* Header Row: Officer + Timestamp */}
                    <View style={styles.logCardHeader}>
                      <View style={styles.officerInfo}>
                        <View style={[styles.officerIconBox, { backgroundColor: `${toStyle.color}1A` }]}>
                          <MaterialIcons name="person" size={14} color={toStyle.color} />
                        </View>
                        <View>
                          <Text style={[styles.officerName, { color: toStyle.color }]}>{log.officerName}</Text>
                          <Text style={styles.officerUnit}>{log.unitId}</Text>
                        </View>
                      </View>
                      <Text style={styles.logTimestamp}>{log.timestamp}</Text>
                    </View>

                    {/* Alert Reference */}
                    <View style={styles.alertRef}>
                      <MaterialIcons name="link" size={12} color={COLORS.onSurfaceVariant} style={{ marginRight: 4 }} />
                      <Text style={styles.alertRefText}>
                        {log.alertTitle} <Text style={styles.alertFileNo}>{log.fileNo}</Text>
                      </Text>
                    </View>

                    {/* Status Transition */}
                    <View style={styles.statusTransition}>
                      <View style={[styles.statusBadge, { backgroundColor: fromStyle.bg }]}>
                        <MaterialIcons name={fromStyle.icon} size={10} color={fromStyle.color} style={{ marginRight: 3 }} />
                        <Text style={[styles.statusBadgeText, { color: fromStyle.color }]}>{log.previousStatus}</Text>
                      </View>

                      <MaterialIcons name="arrow-forward" size={14} color={COLORS.outline} style={{ marginHorizontal: 6 }} />

                      <View style={[styles.statusBadge, { backgroundColor: toStyle.bg, borderWidth: 1, borderColor: `${toStyle.color}40` }]}>
                        <MaterialIcons name={toStyle.icon} size={10} color={toStyle.color} style={{ marginRight: 3 }} />
                        <Text style={[styles.statusBadgeText, { color: toStyle.color, fontWeight: '800' }]}>{log.newStatus}</Text>
                      </View>
                    </View>

                    {/* Note */}
                    {log.note && (
                      <View style={styles.noteContainer}>
                        <MaterialIcons name="short-text" size={14} color={COLORS.outline} style={{ marginRight: 6, marginTop: 1 }} />
                        <Text style={styles.noteText}>{log.note}</Text>
                      </View>
                    )}
                  </TacticalCard>
                </View>
              </View>
            );
          })}
        </View>

        {/* Bottom disclaimer */}
        <View style={styles.disclaimerBox}>
          <MaterialIcons name="lock" size={14} color={COLORS.outline} style={{ marginRight: 6 }} />
          <Text style={styles.disclaimerText}>
            All entries are immutable and cryptographically timestamped. Status changes can only be made from the Alert Details screen.
          </Text>
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
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  logCountBadge: {
    ...TYPOGRAPHY.dataMono,
    fontSize: 10,
    color: COLORS.onSurfaceVariant,
    backgroundColor: COLORS.surfaceContainer,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: ROUNDED.full,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: SPACING.gutter,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    ...TYPOGRAPHY.labelCaps,
    color: COLORS.outline,
  },
  sectionMeta: {
    ...TYPOGRAPHY.dataMono,
    fontSize: 10,
    color: COLORS.outline,
    backgroundColor: 'rgba(155, 143, 122, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: ROUNDED.full,
    overflow: 'hidden',
  },
  timeline: {
    position: 'relative',
  },
  timelineEntry: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timelineTrack: {
    width: 24,
    alignItems: 'center',
    paddingTop: 18,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    zIndex: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.outlineVariant,
    marginTop: 2,
  },
  logCardWrapper: {
    flex: 1,
    marginLeft: 8,
    marginBottom: 8,
  },
  cardPadding: {
    padding: 14,
  },
  logCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  officerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  officerIconBox: {
    width: 28,
    height: 28,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  officerName: {
    ...TYPOGRAPHY.labelCaps,
    fontSize: 10,
    fontWeight: '700',
  },
  officerUnit: {
    ...TYPOGRAPHY.dataMono,
    fontSize: 9,
    color: COLORS.outline,
    marginTop: 1,
  },
  logTimestamp: {
    ...TYPOGRAPHY.dataMono,
    fontSize: 9,
    color: COLORS.outline,
  },
  alertRef: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: COLORS.surfaceLow,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  alertRefText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurface,
    fontWeight: '600',
  },
  alertFileNo: {
    ...TYPOGRAPHY.dataMono,
    fontSize: 10,
    color: COLORS.onSurfaceVariant,
  },
  statusTransition: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: ROUNDED.full,
  },
  statusBadgeText: {
    ...TYPOGRAPHY.labelCaps,
    fontSize: 8,
    fontWeight: '700',
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
  },
  noteText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    flex: 1,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: COLORS.surfaceLow,
    borderRadius: ROUNDED.DEFAULT,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  disclaimerText: {
    ...TYPOGRAPHY.dataMono,
    fontSize: 10,
    color: COLORS.outline,
    flex: 1,
    lineHeight: 16,
  },
});

export default LogsScreen;
