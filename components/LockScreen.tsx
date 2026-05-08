import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing } from '../constants/Colors';
import { useAppStore } from '../store/appStore';

interface LockScreenProps {
  onUnlock: () => void;
}

export default function LockScreen({ onUnlock }: LockScreenProps) {
  const { isDarkMode } = useAppStore();
  const [hasHardware, setHasHardware] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const C = isDarkMode ? Colors.dark : Colors.light;

  useEffect(() => {
    checkDevice();
    // Auto prompt on load
    handleAuth();
  }, []);

  const checkDevice = async () => {
    const hardware = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setHasHardware(hardware);
    setIsEnrolled(enrolled);
  };

  const handleAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Vinyak Infratrack',
        fallbackLabel: 'Use PIN',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        onUnlock();
      } else {
        // User cancelled or failed
      }
    } catch (e: any) {
      Alert.alert('Authentication Error', e.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      <View style={styles.logoBox}>
        <Image 
          source={require('../assets/images/icon.png')} 
          style={{ width: 80, height: 80, resizeMode: 'contain' }} 
        />
      </View>
      <Text style={[styles.title, { color: C.text }]}>Vinyak Infratrack</Text>
      <Text style={[styles.subtitle, { color: C.textSecondary }]}>App is Locked</Text>

      <TouchableOpacity 
        style={[styles.unlockBtn, { backgroundColor: Colors.primary }]} 
        onPress={handleAuth}
      >
        <MaterialCommunityIcons name="fingerprint" size={28} color="#fff" />
        <Text style={styles.unlockText}>Tap to Unlock</Text>
      </TouchableOpacity>

      {!hasHardware && (
        <Text style={[styles.warning, { color: Colors.warning }]}>
          Biometric hardware not found on this device.
        </Text>
      )}
      {hasHardware && !isEnrolled && (
        <Text style={[styles.warning, { color: Colors.warning }]}>
          No biometric or PIN enrolled on this device.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  logoBox: {
    width: 100, height: 100, borderRadius: 24,
    backgroundColor: '#fff', alignItems: 'center',
    justifyContent: 'center', marginBottom: Spacing.md,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 10,
    padding: 10,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: FontSize.md,
    marginBottom: Spacing.xxl,
  },
  unlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 14,
    borderRadius: Radius.full,
    elevation: 4,
  },
  unlockText: {
    color: '#fff',
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  warning: {
    marginTop: Spacing.xl,
    fontSize: FontSize.sm,
    textAlign: 'center',
  }
});
