import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { resetPassword } from '../../services/authService';
import { Colors, Spacing, FontSize, Radius } from '../../constants/Colors';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async () => {
    setError('');
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (e: any) {
      setError(e.code === 'auth/user-not-found' ? 'No account found with this email.' : 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          <Text style={styles.backText}>Back to Login</Text>
        </TouchableOpacity>

        <View style={styles.iconBox}>
          <MaterialCommunityIcons name="lock-reset" size={48} color={Colors.primary} />
        </View>

        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your registered email address. We'll send you a link to reset your password.
        </Text>

        <View style={styles.card}>
          {!sent ? (
            <>
              <TextInput
                mode="outlined" label="Email Address" value={email} onChangeText={setEmail}
                keyboardType="email-address" autoCapitalize="none"
                left={<TextInput.Icon icon="email-outline" />}
                style={styles.input} outlineColor={Colors.border} activeOutlineColor={Colors.primary}
              />
              {error ? (
                <View style={styles.errorBox}>
                  <MaterialCommunityIcons name="alert-circle" size={16} color={Colors.expense} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}
              <Button
                mode="contained" onPress={handleReset} loading={loading} disabled={loading}
                style={styles.btn} contentStyle={styles.btnContent} buttonColor={Colors.primary}
                labelStyle={styles.btnLabel}
              >
                Send Reset Link
              </Button>
            </>
          ) : (
            <View style={styles.successBox}>
              <MaterialCommunityIcons name="check-circle" size={48} color={Colors.income} />
              <Text style={styles.successTitle}>Email Sent!</Text>
              <Text style={styles.successText}>
                Check your inbox at {email} for the password reset link.
              </Text>
              <Button
                mode="contained" onPress={() => router.replace('/(auth)/login')}
                style={styles.btn} buttonColor={Colors.primary} labelStyle={styles.btnLabel}
              >
                Back to Login
              </Button>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgDark },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.md, paddingTop: 60, paddingBottom: 24 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 32 },
  backText: { color: '#fff', fontSize: FontSize.md },
  iconBox: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: Colors.bgCard,
    alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 16,
  },
  title: { fontSize: FontSize.xxl, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: FontSize.md, color: Colors.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  card: {
    backgroundColor: '#fff', borderRadius: Radius.lg, padding: Spacing.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
  },
  input: { marginBottom: Spacing.sm, backgroundColor: '#fff' },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.expenseLight, padding: 10,
    borderRadius: Radius.sm, marginBottom: Spacing.sm,
  },
  errorText: { color: Colors.expense, fontSize: FontSize.sm, flex: 1 },
  btn: { borderRadius: Radius.md, marginTop: 8 },
  btnContent: { paddingVertical: 6 },
  btnLabel: { fontSize: FontSize.lg, fontWeight: '700' },
  successBox: { alignItems: 'center', gap: 12 },
  successTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.income },
  successText: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
});
