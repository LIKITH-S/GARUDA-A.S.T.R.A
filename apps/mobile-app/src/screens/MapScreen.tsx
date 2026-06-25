import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, ROUNDED } from '../constants/theme';
import { AlertItem } from '../utils/mockState';
import PulseIndicator from '../components/PulseIndicator';
import TacticalCard from '../components/TacticalCard';

interface MapScreenProps {
  alerts: AlertItem[];
}

export const MapScreen: React.FC<MapScreenProps> = ({ alerts }) => {
  const radarAnim = useRef(new Animated.Value(0)).current;

  const aaravAlert = alerts.find((a) => a.id === 'missing-aarav');
  const vikramAlert = alerts.find((a) => a.id === 'wanted-vikram');
  const priyaAlert = alerts.find((a) => a.id === 'missing-priya');
  const raviAlert = alerts.find((a) => a.title.toLowerCase().includes('ravi') || a.id.includes('ravi') || a.id.includes('884'));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(radarAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();

    return () => animation.stop();
  }, [radarAnim]);

  const rotate = radarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Helper to determine pulse indicator color based on alert status
  const getPulseColor = (alert: AlertItem | undefined, defaultColor: string) => {
    if (!alert) return 'rgba(155, 143, 122, 0.4)';
    switch (alert.status) {
      case 'ALERT':
        return alert.threatLevel === 'HIGH' ? COLORS.primary : COLORS.secondary;
      case 'INVESTIGATING':
        return COLORS.primary;
      case 'LOCATED':
      case 'COMPLETED':
        return COLORS.secondary; // Cyan glow
      case 'FALSE ALERT':
        return 'rgba(155, 143, 122, 0.4)'; // Off-duty gray
      default:
        return defaultColor;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <MaterialIcons name="explore" size={24} color={COLORS.primary} style={{ marginRight: 8 }} />
          <Text style={styles.headerTitle}>TACTICAL RADAR FEED</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.radarDot} />
          <Text style={styles.radarText}>GPS ACTIVE</Text>
        </View>
      </View>

      <View style={styles.container}>
        {/* Radar Map Sandbox */}
        <View style={styles.radarBox}>
          {/* Grid Background Dots */}
          <View style={styles.gridDotsContainer}>
            {Array.from({ length: 9 }).map((_, i) => (
              <View key={i} style={styles.gridRow}>
                {Array.from({ length: 9 }).map((_, j) => (
                  <View key={j} style={styles.gridDot} />
                ))}
              </View>
            ))}
          </View>

          {/* Radar Circles */}
          <View style={[styles.radarCircle, { width: 100, height: 100, borderRadius: 50 }]} />
          <View style={[styles.radarCircle, { width: 200, height: 200, borderRadius: 100 }]} />
          <View style={[styles.radarCircle, { width: 300, height: 300, borderRadius: 150 }]} />

          {/* Radar Sector Sweep Line */}
          <Animated.View style={[styles.radarSweep, { transform: [{ rotate }] }]}>
            <View style={styles.sweepLine} />
          </Animated.View>

          {/* Target Beacons (Mock Coordinate Overlays) */}
          
          {/* Target 1: Self Unit */}
          <View style={[styles.targetNode, { top: '50%', left: '50%', transform: [{ translateX: -10 }, { translateY: -10 }] }]}>
            <PulseIndicator color={COLORS.secondary} size={16} pulseSize={3} />
            <Text style={styles.targetLabelSelf}>UNIT-042</Text>
          </View>

          {/* Target 2: Vikram Singh Match */}
          {vikramAlert && (
            <View style={[styles.targetNode, { top: '35%', left: '72%' }]}>
              <PulseIndicator
                color={getPulseColor(vikramAlert, COLORS.primary)}
                size={12}
                pulseSize={2.5}
              />
              <Text style={styles.targetLabelPrimary}>
                VIKRAM ({vikramAlert.status})
              </Text>
            </View>
          )}

          {/* Target 3: Aarav Mehta Match */}
          {aaravAlert && (
            <View style={[styles.targetNode, { top: '22%', left: '42%' }]}>
              <PulseIndicator
                color={getPulseColor(aaravAlert, COLORS.primary)}
                size={10}
                pulseSize={2.5}
              />
              <Text style={styles.targetLabelPrimary}>
                AARAV ({aaravAlert.status})
              </Text>
            </View>
          )}

          {/* Target 4: Priya Sharma Match */}
          {priyaAlert && (
            <View style={[styles.targetNode, { top: '65%', left: '25%' }]}>
              <PulseIndicator
                color={getPulseColor(priyaAlert, COLORS.secondary)}
                size={10}
                pulseSize={2.5}
              />
              <Text style={styles.targetLabelSecondary}>
                PRIYA ({priyaAlert.status})
              </Text>
            </View>
          )}

          {/* Target 5: Ravi Kumar Match */}
          {raviAlert && (
            <View style={[styles.targetNode, { top: '48%', left: '78%' }]}>
              <PulseIndicator
                color={getPulseColor(raviAlert, COLORS.secondary)}
                size={10}
                pulseSize={2.5}
              />
              <Text style={styles.targetLabelSecondary}>
                RAVI ({raviAlert.status})
              </Text>
            </View>
          )}
        </View>

        {/* Telemetry panel details */}
        <View style={styles.telemetryOverlay}>
          <TacticalCard containerStyle={styles.telemetryCard}>
            <View style={styles.cardPadding}>
              <View style={styles.telHeader}>
                <Text style={styles.telTitle}>GPS TRACKER READOUT</Text>
                <Text style={styles.telSignal}>SIGNAL: EXCELLENT</Text>
              </View>
              <View style={styles.divider} />
              
              <View style={styles.telRow}>
                <View style={styles.telCol}>
                  <Text style={styles.telLabel}>CURRENT STATION</Text>
                  <Text style={styles.telValue}>Marine Drive Sector 4</Text>
                </View>
                <View style={styles.telCol}>
                  <Text style={styles.telLabel}>SECTOR RANGE</Text>
                  <Text style={styles.telValueMono}>R-MAX: 12.4 KM</Text>
                </View>
              </View>

              <View style={[styles.telRow, { marginTop: 12 }]}>
                <View style={styles.telCol}>
                  <Text style={styles.telLabel}>LATITUDE / LONGITUDE</Text>
                  <Text style={styles.telValueMono}>18.9231° N, 72.8246° E</Text>
                </View>
                <View style={styles.telCol}>
                  <Text style={styles.telLabel}>AZIMUTH SCAN</Text>
                  <Text style={styles.telValueMono}>SWEEP 360° CONT</Text>
                </View>
              </View>
            </View>
          </TacticalCard>
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
    backgroundColor: 'rgba(246, 190, 57, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(246, 190, 57, 0.3)',
    borderRadius: ROUNDED.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  radarDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: 6,
  },
  radarText: {
    ...TYPOGRAPHY.dataMono,
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '700',
  },
  container: {
    flex: 1,
    padding: SPACING.gutter,
    justifyContent: 'space-between',
  },
  radarBox: {
    flex: 1,
    position: 'relative',
    backgroundColor: COLORS.surfaceLowest,
    borderColor: COLORS.outlineVariant,
    borderWidth: 1,
    borderRadius: ROUNDED.lg,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridDotsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'space-around',
    paddingVertical: 20,
    opacity: 0.15,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  gridDot: {
    width: 2,
    height: 2,
    backgroundColor: COLORS.onSurface,
    borderRadius: 1,
  },
  radarCircle: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 52, 0.3)',
  },
  radarSweep: {
    position: 'absolute',
    width: 400,
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sweepLine: {
    width: 2,
    height: 200,
    backgroundColor: 'rgba(3, 181, 211, 0.4)',
    alignSelf: 'center',
    transform: [{ translateY: -100 }],
  },
  targetNode: {
    position: 'absolute',
    alignItems: 'center',
  },
  targetLabelSelf: {
    ...TYPOGRAPHY.labelCaps,
    fontSize: 8,
    color: COLORS.secondary,
    fontWeight: '700',
    marginTop: 4,
  },
  targetLabelPrimary: {
    ...TYPOGRAPHY.labelCaps,
    fontSize: 8,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: 4,
    backgroundColor: COLORS.background,
    paddingHorizontal: 4,
    borderRadius: 2,
  },
  targetLabelSecondary: {
    ...TYPOGRAPHY.labelCaps,
    fontSize: 8,
    color: COLORS.secondary,
    fontWeight: '700',
    marginTop: 4,
    backgroundColor: COLORS.background,
    paddingHorizontal: 4,
    borderRadius: 2,
  },
  telemetryOverlay: {
    marginTop: 16,
    marginBottom: 16,
  },
  telemetryCard: {
    width: '100%',
  },
  cardPadding: {
    padding: 16,
  },
  telHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  telTitle: {
    ...TYPOGRAPHY.labelCaps,
    color: COLORS.primary,
    fontWeight: '700',
  },
  telSignal: {
    ...TYPOGRAPHY.labelCaps,
    fontSize: 9,
    color: COLORS.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.outlineVariant,
    marginVertical: 12,
  },
  telRow: {
    flexDirection: 'row',
    gap: 16,
  },
  telCol: {
    flex: 1,
  },
  telLabel: {
    ...TYPOGRAPHY.labelCaps,
    fontSize: 8,
    color: COLORS.outline,
    lineHeight: 12,
  },
  telValue: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurface,
    fontWeight: '600',
    marginTop: 2,
  },
  telValueMono: {
    ...TYPOGRAPHY.dataMono,
    fontSize: 11,
    color: COLORS.onSurface,
    marginTop: 2,
  },
});
export default MapScreen;
