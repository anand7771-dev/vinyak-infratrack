import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, TouchableOpacity, Image, Dimensions,
} from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { router, Link } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { loginUser } from '../../services/authService';
import { Colors, Spacing, FontSize, Radius } from '../../constants/Colors';

const { height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      await loginUser(email.trim(), password);
      // Auth state listener in _layout.tsx handles navigation
    } catch (e: any) {
      const msg = e.code === 'auth/invalid-credential'
        ? 'Invalid email or password.'
        : e.code === 'auth/network-request-failed'
        ? 'No internet connection. Please check your network.'
        : 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Image source={require('../../assets/images/icon.png')} style={{ width: 130, height: 130, resizeMode: 'contain' }} />
          </View>
          <Text style={styles.companyName}>MS Vinyak Construction</Text>
          <Text style={styles.tagline}>We Build Today For A Better Tomorrow</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome Back</Text>
          <Text style={styles.cardSubtitle}>Sign in to your account</Text>

          <TextInput
            mode="outlined"
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            left={<TextInput.Icon icon="email-outline" />}
            style={styles.input}
            outlineColor={Colors.border}
            activeOutlineColor={Colors.primary}
          />

          <TextInput
            mode="outlined"
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass}
            left={<TextInput.Icon icon="lock-outline" />}
            right={
              <TextInput.Icon
                icon={showPass ? 'eye-off' : 'eye'}
                onPress={() => setShowPass(!showPass)}
              />
            }
            style={styles.input}
            outlineColor={Colors.border}
            activeOutlineColor={Colors.primary}
          />

          {error ? (
            <View style={styles.errorBox}>
              <MaterialCommunityIcons name="alert-circle" size={16} color={Colors.expense} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password')}
            style={styles.forgotBtn}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.loginBtn}
            contentStyle={styles.loginBtnContent}
            buttonColor={Colors.primary}
            labelStyle={styles.loginBtnLabel}
          >
            Sign In
          </Button>

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        <Text style={styles.footer}>© 2025 Vinyak Infratrack</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgDark },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.md },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 32 },
  logoBox: {
    width: 150, height: 150, borderRadius: 24,
    backgroundColor: '#fff', alignItems: 'center',
    justifyContent: 'center', marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25, shadowRadius: 16, elevation: 10,
  },
  companyName: {
    fontSize: FontSize.xl, fontWeight: '800', color: '#fff',
    textAlign: 'center', marginBottom: 4, letterSpacing: 0.5,
  },
  tagline: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', fontStyle: 'italic' },
  card: {
    backgroundColor: '#fff', borderRadius: Radius.lg,
    padding: Spacing.lg, marginBottom: Spacing.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
  },
  cardTitle: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  cardSubtitle: { fontSize: FontSize.md, color: Colors.textSecondary, marginBottom: Spacing.lg },
  input: { marginBottom: Spacing.sm, backgroundColor: '#fff' },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.expenseLight, padding: 10,
    borderRadius: Radius.sm, marginBottom: Spacing.sm,
  },
  errorText: { color: Colors.expense, fontSize: FontSize.sm, flex: 1 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: Spacing.md },
  forgotText: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '600' },
  loginBtn: { borderRadius: Radius.md, marginBottom: Spacing.md },
  loginBtnContent: { paddingVertical: 6 },
  loginBtnLabel: { fontSize: FontSize.lg, fontWeight: '700', letterSpacing: 0.5 },
  signupRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 4 },
  signupText: { fontSize: FontSize.md, color: Colors.textSecondary },
  signupLink: { fontSize: FontSize.md, color: Colors.primary, fontWeight: '700' },
  footer: { textAlign: 'center', color: Colors.textMuted, fontSize: FontSize.xs, paddingBottom: 24 },
});
