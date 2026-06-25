import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, ROUNDED } from '../constants/theme';
import ScanLine from '../components/ScanLine';
import PulseIndicator from '../components/PulseIndicator';

interface LoginScreenProps {
  onLoginSuccess: (data: { unitId: string; role: string; email?: string; full_name?: string }) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [unitId, setUnitId] = useState('officer1@astra.gov');
  const [key, setKey] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [isPersist, setIsPersist] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('AUTHORIZE ACCESS');
  const [isGranted, setIsGranted] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    setStatusText('AUTHORIZING...');
    
    try {
      const { loginApi } = require('../services/api');
      const SecureStore = require('expo-secure-store');
      
      const response = await loginApi(unitId, key);
      
      await SecureStore.setItemAsync('astra_token', response.access_token);
      await SecureStore.setItemAsync('astra_role', response.role || 'patrol');
      await SecureStore.setItemAsync('astra_user_id', response.user_id || unitId);
      
      setIsGranted(true);
      setStatusText('ACCESS GRANTED');
      
      setTimeout(() => {
        setIsLoading(false);
        setIsGranted(false);
        setStatusText('AUTHORIZE ACCESS');
        onLoginSuccess({ 
          unitId: response.user_id || unitId, 
          role: response.role || 'patrol',
          email: unitId,
          full_name: response.full_name
        });
      }, 1000);
    } catch (error: any) {
      setIsLoading(false);
      const errorMessage = error.message || 'ACCESS DENIED';
      setStatusText(errorMessage.toUpperCase());
      
      setTimeout(() => {
        setStatusText('AUTHORIZE ACCESS');
      }, 3000);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <MaterialIcons name="shield" size={24} color={COLORS.primary} style={{ marginRight: 8 }} />
            <Text style={styles.headerTitle}>GARUDA ASTRA</Text>
          </View>
          <View style={styles.headerBadgeContainer}>
            <Text style={styles.badgeText}>UNIT-042</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Portrait Container */}
          <View style={styles.portraitWrapper}>
            <View style={styles.portraitBorder}>
              <ScanLine color={COLORS.secondary} duration={2500} />
              <Image
                source={require('../../assets/icon.png')}
                style={styles.portrait}
              />
            </View>
            <Text style={styles.portraitTitle}>Tactical Operations</Text>
            <Text style={styles.portraitSubtitle}>
              Command authorization required for system access.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>OFFICER EMAIL</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="badge" size={20} color={COLORS.outline} style={{ marginRight: 10 }} />
                <TextInput
                  value={unitId}
                  onChangeText={setUnitId}
                  style={styles.input}
                  placeholder="officer1@astra.gov"
                  placeholderTextColor={COLORS.outline}
                  keyboardAppearance="dark"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ENCRYPTION KEY</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="vpn-key" size={20} color={COLORS.outline} style={{ marginRight: 10 }} />
                <TextInput
                  value={key}
                  onChangeText={setKey}
                  style={styles.input}
                  placeholder="Password123!"
                  placeholderTextColor={COLORS.outline}
                  secureTextEntry={!showPassword}
                  keyboardAppearance="dark"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                  <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color={COLORS.outline} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Remember and Forgot Key */}
            <View style={styles.switchRow}>
              <View style={styles.switchContainer}>
                <Switch
                  value={isPersist}
                  onValueChange={setIsPersist}
                  trackColor={{ false: COLORS.surfaceHigh, true: COLORS.primaryContainer }}
                  thumbColor={isPersist ? COLORS.primary : COLORS.outline}
                />
                <Text style={styles.switchLabel}>PERSIST SESSION</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.forgotText}>FORGOT KEY</Text>
              </TouchableOpacity>
            </View>

            {/* Authorize Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              style={[
                styles.button,
                isGranted ? styles.buttonSuccess : styles.buttonNormal,
              ]}
            >
              {isLoading && !isGranted && (
                <ActivityIndicator size="small" color={COLORS.onPrimary} style={styles.spinner} />
              )}
              {isGranted && (
                <MaterialIcons name="check-circle" size={20} color={COLORS.onSurface} style={{ marginRight: 8 }} />
              )}
              <Text
                style={[
                  styles.buttonText,
                  isGranted ? styles.buttonTextSuccess : styles.buttonTextNormal,
                ]}
              >
                {statusText}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Grid Indicators */}
          <View style={styles.indicatorsGrid}>
            <View style={styles.indicatorCard}>
              <View style={styles.indicatorIconWrapper}>
                <MaterialIcons name="sensors" size={18} color={COLORS.secondary} />
              </View>
              <View>
                <Text style={styles.indicatorLabel}>NETWORK</Text>
                <Text style={styles.indicatorValueBlue}>LINK ACTIVE</Text>
              </View>
            </View>

            <View style={styles.indicatorCard}>
              <View style={styles.indicatorIconWrapper}>
                <PulseIndicator color={COLORS.primary} size={8} pulseSize={2.5} />
              </View>
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.indicatorLabel}>ENCRYPTION</Text>
                <Text style={styles.indicatorValuePrimary}>AES-256</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerSecure}>
            <PulseIndicator color={COLORS.secondary} size={6} pulseSize={3} />
            <Text style={styles.footerSecureText}>
              SECURE CONNECTION ESTABLISHED - MUN-HQ-SRV-04
            </Text>
          </View>
          <Text style={styles.footerCopyright}>
            © 2026 GARUDA ASTRA | TACTICAL OPS COMMAND
          </Text>
        </View>
      </KeyboardAvoidingView>
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
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.gutter,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  headerTitle: {
    ...TYPOGRAPHY.headlineSmMobile,
    color: COLORS.primary,
    fontWeight: '700',
  },
  headerBadgeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: ROUNDED.sm,
  },
  badgeText: {
    ...TYPOGRAPHY.dataMono,
    color: COLORS.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.gutter,
  },
  portraitWrapper: {
    alignItems: 'center',
    marginBottom: 24,
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
    marginBottom: 12,
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
    marginTop: 4,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    ...TYPOGRAPHY.labelCaps,
    color: COLORS.onSurfaceVariant,
    marginBottom: 6,
    paddingLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: ROUNDED.lg,
    paddingHorizontal: 12,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 10,
    color: COLORS.outline,
  },
  input: {
    flex: 1,
    height: 48,
    color: COLORS.onSurface,
    ...TYPOGRAPHY.dataMono,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    ...TYPOGRAPHY.labelCaps,
    color: COLORS.onSurfaceVariant,
    marginLeft: 8,
  },
  forgotText: {
    ...TYPOGRAPHY.labelCaps,
    color: COLORS.secondary,
  },
  button: {
    height: 56,
    borderRadius: ROUNDED.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonNormal: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
  },
  buttonSuccess: {
    backgroundColor: COLORS.secondaryContainer,
    shadowColor: COLORS.secondaryContainer,
  },
  buttonText: {
    ...TYPOGRAPHY.headlineSm,
    fontWeight: '700',
  },
  buttonTextNormal: {
    color: COLORS.onPrimary,
  },
  buttonTextSuccess: {
    color: COLORS.onSurface,
  },
  buttonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  spinner: {
    marginRight: 8,
  },
  indicatorsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 32,
  },
  indicatorCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLow,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: ROUNDED.DEFAULT,
    padding: 12,
  },
  indicatorIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(3, 181, 211, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  indicatorIconBlue: {
    fontSize: 14,
  },
  indicatorLabel: {
    ...TYPOGRAPHY.labelCaps,
    fontSize: 9,
    color: COLORS.outline,
    lineHeight: 12,
  },
  indicatorValueBlue: {
    ...TYPOGRAPHY.dataMono,
    color: COLORS.secondary,
    fontSize: 12,
  },
  indicatorValuePrimary: {
    ...TYPOGRAPHY.dataMono,
    color: COLORS.primary,
    fontSize: 12,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(79, 70, 52, 0.2)',
  },
  footerSecure: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  footerSecureText: {
    ...TYPOGRAPHY.labelCaps,
    fontSize: 9,
    color: COLORS.secondary,
    marginLeft: 6,
  },
  footerCopyright: {
    ...TYPOGRAPHY.labelCaps,
    fontSize: 9,
    color: COLORS.outlineVariant,
  },
});
export default LoginScreen;
