import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, BackHandler, ToastAndroid, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as IntentLauncher from 'expo-intent-launcher';

// Theme & Mock Data
import { COLORS, TYPOGRAPHY, SPACING, ROUNDED } from './src/constants/theme';
import {
  INITIAL_OFFICER,
  INITIAL_ALERTS,
  INITIAL_CASES,
  INITIAL_MESSAGES,
  INITIAL_AUDIT_LOGS,
  SIMULATED_DEMO_ALERT,
  AlertItem,
  CaseItem,
  MessageItem,
  OfficerProfile,
  AuditLogEntry,
} from './src/utils/mockState';

// Services — new persistent background layer
import * as DutyManager from './src/services/dutyManager';
import { checkAllPermissionsStatus, requestPermissionType } from './src/services/permissionService';

// Alert service — callbacks only (WebSocket is in socketManager now)
import {
  registerAlertCallbacks,
  unregisterAlertCallbacks,
  simulateIncomingAlert,
} from './src/utils/alertService';

// Screens
import { LoginScreen } from './src/screens/LoginScreen';
import { AlertsScreen } from './src/screens/AlertsScreen';
import { AlertDetailsScreen } from './src/screens/AlertDetailsScreen';
import { CasesScreen } from './src/screens/CasesScreen';
import { LogsScreen } from './src/screens/LogsScreen';
import { MapScreen } from './src/screens/MapScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { PermissionGuardScreen } from './src/screens/PermissionGuardScreen';
import { DutyToggleScreen } from './src/screens/DutyToggleScreen';
import { TacticalAlertPopup } from './src/components/TacticalAlertPopup';

type ScreenType = 'alerts' | 'details' | 'cases' | 'logs' | 'map' | 'profile';

const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:8000/api/v1/ws/connect';

export default function App() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('alerts');
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [permissionsAuthorized, setPermissionsAuthorized] = useState(false);
  const [dutyAcknowledged, setDutyAcknowledged] = useState(false);

  // Live state tracking
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [cases, setCases] = useState<CaseItem[]>(INITIAL_CASES);
  const [messages, setMessages] = useState<MessageItem[]>(INITIAL_MESSAGES);
  const [officer, setOfficer] = useState<OfficerProfile>(INITIAL_OFFICER);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // Tactical Overlay Alert State
  const [tacticalAlertVisible, setTacticalAlertVisible] = useState(false);
  const [incomingTacticalAlert, setIncomingTacticalAlert] = useState<AlertItem | null>(null);

  // Degraded active permissions tracking (fault tolerance)
  const [degradedPermissions, setDegradedPermissions] = useState<('foreground' | 'background' | 'notifications')[]>([]);

  // =====================================================
  // DUTY LIFECYCLE HOOK — Controls entire background layer
  // =====================================================
  useEffect(() => {
    let simulatedAlertTimer: NodeJS.Timeout;

    if (isAuthorized) {
      // Register alert callbacks (for both WebSocket and simulated alerts)
      registerAlertCallbacks({
        onNewAlert: (alert) => setAlerts((prev) => [alert, ...prev]),
        onTacticalPopup: (alert) => {
          setIncomingTacticalAlert(alert);
          setTacticalAlertVisible(true);
        },
      });

      if (officer.status === 'ACTIVE DUTY') {
        // GO ON DUTY — starts foreground service, WebSocket, GPS, telemetry
        DutyManager.goOnDuty({
          officerId: officer.unitId,
          officerName: officer.name,
          officerRank: officer.rank,
          wsUrl: WS_URL,
          telemetryIntervalMs: 5000,
        });
      } else {
        // GO OFF DUTY — stops everything, removes notification
        DutyManager.goOffDuty();
      }
    } else {
      // LOGGED OUT — stop everything
      DutyManager.goOffDuty();
      unregisterAlertCallbacks();
      setTacticalAlertVisible(false);
      setIncomingTacticalAlert(null);
    }

    return () => {
      DutyManager.goOffDuty();
      unregisterAlertCallbacks();
      if (simulatedAlertTimer) {
        clearTimeout(simulatedAlertTimer);
      }
    };
  }, [isAuthorized, officer.status]);

  // Periodic Permission Monitor Hook (Fault Tolerance)
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const performCheck = async () => {
      if (isAuthorized) {
        const status = await checkAllPermissionsStatus();
        const degraded: ('foreground' | 'background' | 'notifications')[] = [];
        if (!status.foreground) degraded.push('foreground');
        if (!status.background) degraded.push('background');
        if (!status.notifications) degraded.push('notifications');
        setDegradedPermissions(degraded);
      }
    };

    if (isAuthorized) {
      performCheck(); // Run immediate initial check
      interval = setInterval(performCheck, 5000); // Check every 5 seconds
    } else {
      setDegradedPermissions([]);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAuthorized]);

  const handleRestorePermission = async (type: 'foreground' | 'background' | 'notifications') => {
    const granted = await requestPermissionType(type);
    if (granted) {
      setDegradedPermissions((prev) => prev.filter((p) => p !== type));
    }
  };

  // Hardware Back Button Interception (Prevent exit if on duty)
  useEffect(() => {
    const onBackPress = () => {
      if (isAuthorized && officer.status === 'ACTIVE DUTY') {
        if (Platform.OS === 'android') {
          // Send app to background simulating the Home button press
          IntentLauncher.startActivityAsync('android.intent.action.MAIN', {
            category: 'android.intent.category.HOME',
            flags: 268435456, // FLAG_ACTIVITY_NEW_TASK
          }).catch(() => {
             // Fallback if intent fails
             ToastAndroid.show('Tactical Terminal running. Press Home to minimize, or go OFF DUTY to exit.', ToastAndroid.SHORT);
          });
        }
        return true; // Prevent default exit
      }
      return false; // Let default behavior (exit app) proceed
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => {
      subscription.remove();
    };
  }, [isAuthorized, officer.status]);

  // Authentication Callbacks
  const handleLoginSuccess = (data: { unitId: string; role: string; email?: string; full_name?: string }) => {
    setIsAuthorized(true);
    setCurrentScreen('alerts');

    // Update officer state with actual logged in user
    setOfficer(prev => ({
      ...prev,
      name: data.full_name || data.email?.split('@')[0].toUpperCase() || 'OFFICER',
      unitId: data.unitId,
      rank: data.role.toUpperCase(),
      status: 'OFF DUTY',
    }));

    // Telemetry broadcast will be dropped silently until duty is activated
    DutyManager.sendEvent('LOGIN', data.unitId, data.full_name || data.email || 'OFFICER', 'OFFICER LOGGED IN');
  };

  const handleAcknowledgeTacticalAlert = () => {
    setTacticalAlertVisible(false);
    if (incomingTacticalAlert) {
      handleSelectAlert(incomingTacticalAlert);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'TERMINATE SESSION',
      'Are you sure you want to log out of the tactical command terminal?',
      [
        { text: 'CANCEL', style: 'cancel' },
        {
          text: 'LOGOUT',
          style: 'destructive',
          onPress: () => {
            // Immediate telemetry broadcast BEFORE clearing session
            DutyManager.sendEvent('LOGOUT', officer.unitId, officer.name, 'OFFICER LOGGED OUT');
            setIsAuthorized(false);
            setDutyAcknowledged(false);
            setCurrentScreen('alerts');
            setSelectedAlert(null);
            setAlerts(INITIAL_ALERTS); // Reset alerts to prevent stale duplicates
            setAuditLogs(INITIAL_AUDIT_LOGS); // Reset audit trail
          },
        },
      ]
    );
  };

  const handleDutyAcknowledge = (status: string) => {
    handleUpdateOfficerStatus(status);
    setDutyAcknowledged(true);
  };

  // State update callbacks
  const handleSelectAlert = (alert: AlertItem) => {
    setSelectedAlert(alert);
    setCurrentScreen('details');
  };

  const handleRespondAlert = (alertId: string) => {
    // Proactively update status to 'INVESTIGATING'
    setAlerts((prevAlerts) =>
      prevAlerts.map((a) => (a.id === alertId ? { ...a, status: 'INVESTIGATING' } : a))
    );

    const targetAlert = alerts.find((a) => a.id === alertId);
    if (targetAlert) {
      setSelectedAlert({ ...targetAlert, status: 'INVESTIGATING' });
      setCurrentScreen('details');
    }
  };

  const handleUpdateAlertStatus = async (alertId: string, status: AlertItem['status']) => {
    // Find the alert to get previous status for audit
    const targetAlert = alerts.find((a) => a.id === alertId);
    const previousStatus = targetAlert?.status || 'ALERT';

    try {
      const { verifyAlertApi, rejectAlertApi } = require('./src/services/api');
      if (status === 'FALSE ALARM') {
        await rejectAlertApi(alertId);
      } else if (status === 'RESOLVED' || status === 'APPREHENDED') {
        await verifyAlertApi(alertId);
      }
    } catch (e) {
      console.error('Failed to sync alert status with backend', e);
    }

    setAlerts((prevAlerts) =>
      prevAlerts.map((a) => (a.id === alertId ? { ...a, status } : a))
    );
    // Also update selected alert state
    setSelectedAlert((prev) => (prev && prev.id === alertId ? { ...prev, status } : prev));

    // Append audit log entry
    const newLogEntry: AuditLogEntry = {
      id: `log-${Date.now()}`,
      alertId,
      alertTitle: targetAlert?.title || alertId,
      fileNo: targetAlert?.fileNo || 'N/A',
      officerName: officer.name,
      unitId: officer.unitId,
      previousStatus,
      newStatus: status,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' UTC',
      note: `Status changed by ${officer.name} from field.`,
    };
    setAuditLogs((prev) => [newLogEntry, ...prev]);
  };

  const handleUpdateOfficerStatus = (status: string) => {
    setOfficer((prev) => ({ ...prev, status }));
    // Duty toggle is handled by the useEffect above reacting to officer.status change
  };

  const handleSendMessage = (text: string) => {
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: MessageItem = {
      id: `msg-user-${Date.now()}`,
      sender: 'PATROL UNIT-042',
      text,
      timestamp: timeString,
    };

    setMessages((prev) => [...prev, newMsg]);

    // Simulated Dispatch HQ bidirectional transmission
    setTimeout(() => {
      const hqMsg: MessageItem = {
        id: `msg-hq-${Date.now()}`,
        sender: 'DISPATCH HQ',
        text: `Acknowledged, Patrol 042. Localized GPS tracking showing active bearing. Remain alert for target Vikram Singh at Sector 4.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, hqMsg]);
    }, 1800);
  };

  const handleSosTrigger = () => {
    // Send SOS telemetry
    DutyManager.sendEvent('SOS', officer.unitId, officer.name, 'EMERGENCY SOS');

    Alert.alert(
      'EMERGENCY SOS ACTIVATED',
      'Tactical distress telemetry has been broadcast to command centers. Municipal patrol backups dispatched. Stay behind cover.',
      [{ text: 'STAND BY / ACKNOWLEDGE', style: 'destructive' }],
      { cancelable: false }
    );
  };

  // Nav back handler
  const handleBackToAlerts = () => {
    setCurrentScreen('alerts');
    setSelectedAlert(null);
  };

  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'alerts':
        return (
          <AlertsScreen
            alerts={alerts}
            onSelectAlert={handleSelectAlert}
            onRespondAlert={handleRespondAlert}
            onSosTrigger={handleSosTrigger}
          />
        );
      case 'details':
        return (
          <AlertDetailsScreen
            alert={selectedAlert!}
            onBack={handleBackToAlerts}
            onUpdateStatus={handleUpdateAlertStatus}
          />
        );
      case 'cases':
        return <CasesScreen cases={cases} />;
      case 'logs':
        return <LogsScreen auditLogs={auditLogs} />;
      case 'map':
        return <MapScreen alerts={alerts} />;
      case 'profile':
        return (
          <ProfileScreen
            officer={officer}
            onLogout={handleLogout}
            onUpdateStatus={handleUpdateOfficerStatus}
          />
        );
      default:
        return <View style={styles.emptyContainer} />;
    }
  };

  if (!permissionsAuthorized) {
    return (
      <SafeAreaProvider>
        <View style={styles.rootContainer}>
          <StatusBar style="light" />
          <PermissionGuardScreen onAllPermissionsGranted={() => setPermissionsAuthorized(true)} />
        </View>
      </SafeAreaProvider>
    );
  }

  if (!isAuthorized) {
    return (
      <SafeAreaProvider>
        <View style={styles.rootContainer}>
          <StatusBar style="light" />
          <LoginScreen onLoginSuccess={handleLoginSuccess} />
        </View>
      </SafeAreaProvider>
    );
  }

  if (!dutyAcknowledged) {
    return (
      <SafeAreaProvider>
        <View style={styles.rootContainer}>
          <StatusBar style="light" />
          <DutyToggleScreen 
            officerName={officer.name} 
            onAcknowledge={handleDutyAcknowledge} 
          />
        </View>
      </SafeAreaProvider>
    );
  }

  // Render full application with top header and bottom tabs navigation
  return (
    <SafeAreaProvider>
      <View style={styles.rootContainer}>
        <StatusBar style="light" />

        {/* Flashing Degraded Permissions Warning Banner (Fault Tolerance) */}
        {degradedPermissions.length > 0 && (
          <View style={styles.warningBanner}>
            <MaterialIcons name="warning" size={16} color="#17130a" style={{ marginRight: 6 }} />
            <Text style={styles.warningBannerText}>
              TELEMETRY DEGRADED: {degradedPermissions.map((p) => p.toUpperCase()).join(' & ')} REQUIRED
            </Text>
            <TouchableOpacity
              style={styles.warningBannerButton}
              onPress={() => handleRestorePermission(degradedPermissions[0])}
            >
              <Text style={styles.warningBannerButtonText}>RESTORE</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Active Screen Rendering */}
        <View style={styles.screenContainer}>{renderScreen()}</View>

        {/* Tactical Full-screen Attention-grabbing Popup */}
        <TacticalAlertPopup
          visible={tacticalAlertVisible}
          alert={incomingTacticalAlert}
          onAcknowledge={handleAcknowledgeTacticalAlert}
        />

        {/* Standardized Bottom Navigation Shell (hidden in details view) */}
        {currentScreen !== 'details' && (
          <View style={styles.bottomNav}>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => setCurrentScreen('alerts')}
            >
              <View style={[styles.navItemInner, currentScreen === 'alerts' && styles.navItemActive]}>
                <MaterialIcons
                  name="notifications-active"
                  size={22}
                  color={currentScreen === 'alerts' ? COLORS.primary : COLORS.onSurfaceVariant}
                  style={{ opacity: currentScreen === 'alerts' ? 1 : 0.6 }}
                />
                <Text style={[styles.navLabel, currentScreen === 'alerts' && styles.navLabelActive]}>ALERTS</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => setCurrentScreen('cases')}
            >
              <View style={[styles.navItemInner, currentScreen === 'cases' && styles.navItemActive]}>
                <MaterialIcons
                  name="folder-shared"
                  size={22}
                  color={currentScreen === 'cases' ? COLORS.primary : COLORS.onSurfaceVariant}
                  style={{ opacity: currentScreen === 'cases' ? 1 : 0.6 }}
                />
                <Text style={[styles.navLabel, currentScreen === 'cases' && styles.navLabelActive]}>CASES</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => setCurrentScreen('logs')}
            >
              <View style={[styles.navItemInner, currentScreen === 'logs' && styles.navItemActive]}>
                <MaterialIcons
                  name="history"
                  size={22}
                  color={currentScreen === 'logs' ? COLORS.primary : COLORS.onSurfaceVariant}
                  style={{ opacity: currentScreen === 'logs' ? 1 : 0.6 }}
                />
                <Text style={[styles.navLabel, currentScreen === 'logs' && styles.navLabelActive]}>LOGS</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => setCurrentScreen('map')}
            >
              <View style={[styles.navItemInner, currentScreen === 'map' && styles.navItemActive]}>
                <MaterialIcons
                  name="explore"
                  size={22}
                  color={currentScreen === 'map' ? COLORS.primary : COLORS.onSurfaceVariant}
                  style={{ opacity: currentScreen === 'map' ? 1 : 0.6 }}
                />
                <Text style={[styles.navLabel, currentScreen === 'map' && styles.navLabelActive]}>MAP</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => setCurrentScreen('profile')}
            >
              <View style={[styles.navItemInner, currentScreen === 'profile' && styles.navItemActive]}>
                <MaterialIcons
                  name="account-circle"
                  size={22}
                  color={currentScreen === 'profile' ? COLORS.primary : COLORS.onSurfaceVariant}
                  style={{ opacity: currentScreen === 'profile' ? 1 : 0.6 }}
                />
                <Text style={[styles.navLabel, currentScreen === 'profile' && styles.navLabelActive]}>PROFILE</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screenContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainer,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
    paddingTop: 8,
    paddingBottom: 28, // High-fidelity clearance for modern rounded notch edges
    paddingHorizontal: 12,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: ROUNDED.DEFAULT,
  },
  navItemActive: {
    backgroundColor: 'rgba(246, 190, 57, 0.12)',
  },
  navIcon: {
    fontSize: 20,
    opacity: 0.6,
    textAlign: 'center',
  },
  navIconActive: {
    opacity: 1,
  },
  navLabel: {
    ...TYPOGRAPHY.labelCaps,
    fontSize: 9,
    color: COLORS.onSurfaceVariant,
    opacity: 0.6,
    marginTop: 3,
    fontWeight: '700',
  },
  navLabelActive: {
    color: COLORS.primary,
    opacity: 1,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6BE39',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(23, 19, 10, 0.2)',
  },
  warningBannerText: {
    ...TYPOGRAPHY.labelCaps,
    fontSize: 9,
    fontWeight: '900',
    color: '#17130a',
    flex: 1,
    letterSpacing: 0.5,
  },
  warningBannerButton: {
    backgroundColor: '#17130a',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  warningBannerButtonText: {
    ...TYPOGRAPHY.labelCaps,
    fontSize: 8,
    fontWeight: '800',
    color: '#F6BE39',
  },
});
