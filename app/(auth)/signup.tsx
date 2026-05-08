import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, TouchableOpacity,
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { registerUser } from '../../services/authService';
import { Colors, Spacing, FontSize, Radius } from '../../constants/Colors';
import { UserRole } from '../../constants/types';

const ROLES: { label: string; value: UserRole; icon: string }[] = [
  { label: 'Admin', value: 'admin', icon: 'shield-account' },
  { label: 'Partner', value: 'partner', icon: 'handshake' },
  { label: 'Staff', value: 'staff', icon: 'account-hard-hat' },
];

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('staff');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    setError('');
    if (!name || !email || !mobile || !password) {
      setError('All fields are required.');
      return;
    }
    if (mobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await registerUser(email.trim(), password, name.trim(), mobile.trim(), role);
    } catch (e: any) {
      const msg = e.code === 'auth/email-already-in-use'
        ? 'This email is already registered.'
        : e.code === 'auth/network-request-failed'
        ? 'No internet. Please check your connection.'
        : 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.logoBox}>
            <MaterialCommunityIcons name="hard-hat" size={36} color="#fff" />
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Vinyak Infratrack</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <TextInput mode="outlined" label="Full Name" value={name} onChangeText={setName}
            left={<TextInput.Icon icon="account-outline" />} style={styles.input}
            outlineColor={Colors.border} activeOutlineColor={Colors.primary} />

          <TextInput mode="outlined" label="Email Address" value={email} onChangeText={setEmail}
            keyboardType="email-address" autoCapitalize="none"
            left={<TextInput.Icon icon="email-outline" />} style={styles.input}
            outlineColor={Colors.border} activeOutlineColor={Colors.primary} />

          <TextInput mode="outlined" label="Mobile Number" value={mobile} onChangeText={setMobile}
            keyboardType="phone-pad" maxLength={10}
            left={<TextInput.Icon icon="phone-outline" />} style={styles.input}
            outlineColor={Colors.border} activeOutlineColor={Colors.primary} />

          <TextInput mode="outlined" label="Password" value={password} onChangeText={setPassword}
            secureTextEntry={!showPass}
            left={<TextInput.Icon icon="lock-outline" />}
            right={<TextInput.Icon icon={showPass ? 'eye-off' : 'eye'} onPress={() => setShowPass(!showPass)} />}
            style={styles.input} outlineColor={Colors.border} activeOutlineColor={Colors.primary} />

          {/* Role Selection */}
          <Text style={styles.roleLabel}>Select Your Role</Text>
          <View style={styles.roleRow}>
            {ROLES.map((r) => (
              <TouchableOpacity
                key={r.value}
                style={[styles.roleChip, role === r.value && styles.roleChipActive]}
                onPress={() => setRole(r.value)}
              >
                <MaterialCommunityIcons
                  name={r.icon as any}
                  size={20}
                  color={role === r.value ? '#fff' : Colors.textSecondary}
                />
                <Text style={[styles.roleChipText, role === r.value && styles.roleChipTextActive]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <MaterialCommunityIcons name="alert-circle" size={16} color={Colors.expense} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Button
            mode="contained" onPress={handleSignup} loading={loading} disabled={loading}
            style={styles.btn} contentStyle={styles.btnContent} buttonColor={Colors.primary}
            labelStyle={styles.btnLabel}
          >
            Create Account
          </Button>

          <TouchableOpacity onPress={() => router.back()} style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgDark },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.md, paddingBottom: 24 },
  header: { alignItems: 'center', paddingTop: 50, paddingBottom: 24 },
  backBtn: { position: 'absolute', top: 50, left: 0, padding: 8 },
  logoBox: {
    width: 64, height: 64, borderRadius: 16, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  title: { fontSize: FontSize.xxl, fontWeight: '700', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: FontSize.md, color: Colors.textMuted },
  card: {
    backgroundColor: '#fff', borderRadius: Radius.lg, padding: Spacing.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15,
    shadowRadius: 12, elevation: 8,
  },
  input: { marginBottom: Spacing.sm, backgroundColor: '#fff' },
  roleLabel: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary, marginBottom: 10, marginTop: 4 },
  roleRow: { flexDirection: 'row', gap: 8, marginBottom: Spacing.md },
  roleChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, padding: 10, borderRadius: Radius.sm, borderWidth: 1.5,
    borderColor: Colors.border, backgroundColor: '#fff',
  },
  roleChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  roleChipText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  roleChipTextActive: { color: '#fff' },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.expenseLight, padding: 10,
    borderRadius: Radius.sm, marginBottom: Spacing.sm,
  },
  errorText: { color: Colors.expense, fontSize: FontSize.sm, flex: 1 },
  btn: { borderRadius: Radius.md, marginTop: 4 },
  btnContent: { paddingVertical: 6 },
  btnLabel: { fontSize: FontSize.lg, fontWeight: '700' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  loginText: { fontSize: FontSize.md, color: Colors.textSecondary },
  loginLink: { fontSize: FontSize.md, color: Colors.primary, fontWeight: '700' },
});
