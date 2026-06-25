import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, ROUNDED } from '../constants/theme';
import { CaseItem } from '../utils/mockState';
import TacticalCard from '../components/TacticalCard';

interface CasesScreenProps {
  cases: CaseItem[];
}

export const CasesScreen: React.FC<CasesScreenProps> = ({ cases }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <MaterialIcons name="folder-shared" size={24} color={COLORS.primary} style={{ marginRight: 8 }} />
          <Text style={styles.headerTitle}>ACTIVE CASES</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.headerCount}>{cases.length} UNRESOLVED</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {cases.map((item) => (
          <TacticalCard
            key={item.id}
            accentColor={COLORS.primary}
            containerStyle={styles.cardContainer}
          >
            <View style={styles.cardPadding}>
              <View style={styles.row}>
                {/* Image */}
                <View style={styles.imageWrapper}>
                  <Image source={{ uri: item.photoUrl }} style={styles.image} />
                </View>

                {/* Details */}
                <View style={styles.detailsCol}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>{item.name}</Text>
                    <View style={styles.badgeRow}>
                      <View
                        style={[
                          styles.typeBadge,
                          {
                            backgroundColor:
                              item.caseType === 'WANTED'
                                ? 'rgba(255, 180, 171, 0.12)'
                                : 'rgba(76, 215, 246, 0.12)',
                            borderColor:
                              item.caseType === 'WANTED'
                                ? COLORS.error
                                : COLORS.secondary,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.typeText,
                            {
                              color:
                                item.caseType === 'WANTED'
                                  ? COLORS.error
                                  : COLORS.secondary,
                            },
                          ]}
                        >
                          {item.caseType}
                        </Text>
                      </View>
                      <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>{item.status}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.grid}>
                    <View style={styles.gridItem}>
                      <Text style={styles.label}>AGE / GENDER</Text>
                      <Text style={styles.value}>
                        {item.age} YRS • {item.gender}
                      </Text>
                    </View>
                    <View style={styles.gridItem}>
                      <Text style={styles.label}>
                        {item.caseType === 'WANTED' ? 'OUTSTANDING SINCE' : 'MISSING SINCE'}
                      </Text>
                      <Text style={styles.value}>{item.missingSince}</Text>
                    </View>
                  </View>

                  <View style={styles.lastSeenRow}>
                    <Text style={styles.label}>LAST SEEN AREA</Text>
                    <Text style={styles.value}>
                      <MaterialIcons name="place" size={14} color={COLORS.primary} /> {item.lastSeen}
                    </Text>
                  </View>
                </View>
              </View>

              {item.description && (
                <Text style={styles.descriptionText} numberOfLines={2}>
                  {item.description}
                </Text>
              )}

              <TouchableOpacity style={styles.footerButton}>
                <Text style={styles.footerButtonText}>OPEN CASE DOSSIER</Text>
              </TouchableOpacity>
            </View>
          </TacticalCard>
        ))}
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
    backgroundColor: 'rgba(212, 160, 23, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 160, 23, 0.3)',
    borderRadius: ROUNDED.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerCount: {
    ...TYPOGRAPHY.dataMono,
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '700',
  },
  scrollContent: {
    padding: SPACING.gutter,
    paddingBottom: 48,
  },
  cardContainer: {
    marginBottom: 16,
  },
  cardPadding: {
    padding: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  imageWrapper: {
    width: 100,
    height: 120,
    borderRadius: ROUNDED.DEFAULT,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceLow,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    opacity: 0.8,
  },
  detailsCol: {
    flex: 1,
    justifyContent: 'space-between',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    ...TYPOGRAPHY.headlineSm,
    color: COLORS.onSurface,
    fontWeight: '700',
  },
  statusBadge: {
    backgroundColor: 'rgba(246, 190, 57, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: ROUNDED.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  statusText: {
    ...TYPOGRAPHY.labelCaps,
    fontSize: 8,
    color: COLORS.primary,
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: ROUNDED.sm,
    borderWidth: 1,
  },
  typeText: {
    ...TYPOGRAPHY.labelCaps,
    fontSize: 8,
    fontWeight: '700',
  },
  descriptionText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: 10,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  grid: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 12,
  },
  gridItem: {
    flex: 1,
  },
  label: {
    ...TYPOGRAPHY.labelCaps,
    fontSize: 8,
    color: COLORS.outline,
    lineHeight: 12,
  },
  value: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurface,
    fontWeight: '600',
    marginTop: 2,
  },
  lastSeenRow: {
    marginTop: 8,
  },
  footerButton: {
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: ROUNDED.DEFAULT,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
    backgroundColor: COLORS.surfaceLow,
  },
  footerButtonText: {
    ...TYPOGRAPHY.labelCaps,
    fontSize: 10,
    color: COLORS.onSurfaceVariant,
    fontWeight: '700',
  },
});
export default CasesScreen;
