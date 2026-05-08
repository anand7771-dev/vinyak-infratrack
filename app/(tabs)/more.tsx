import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Image, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { logoutUser } from '../../services/authService';
import { Colors, Spacing, FontSize, Radius } from '../../constants/Colors';

export default function MoreScreen() {
  const { user, clearAuth } = useAuthStore();
  const { isDarkMode, toggleDarkMode, unreadCount } = useAppStore();
  const C = isDarkMode ? Colors.dark : Colors.light;

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logoutUser();
          clearAuth();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const ROLE_COLORS: Record<string, string> = {
    admin: Colors.primary,
    partner: Colors.info,
    staff: Colors.warning,
  };

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors.bgDark }]}>
        <Text style={styles.headerTitle}>More</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <TouchableOpacity
          style={[styles.profileCard, { backgroundColor: C.card }]}
          onPress={() => router.push('/profile')}
        >
          <View style={styles.avatar}>
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() ?? '?'}
              </Text>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: C.text }]}>{user?.name ?? 'User'}</Text>
            <Text style={[styles.profileEmail, { color: C.textSecondary }]}>{user?.email}</Text>
            <View style={[styles.roleBadge, { backgroundColor: ROLE_COLORS[user?.role ?? 'staff'] + '20' }]}>
              <Text style={[styles.roleText, { color: ROLE_COLORS[user?.role ?? 'staff'] }]}>
                {(user?.role ?? 'staff').toUpperCase()}
              </Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color={C.textSecondary} />
        </TouchableOpacity>

        {/* Menu Items */}
        <View style={[styles.menuSection, { backgroundColor: C.card }]}>
          <Text style={[styles.menuSectionTitle, { color: C.textSecondary }]}>RECORDS</Text>

          <MenuItem
            icon="swap-horizontal" label="All Transactions" C={C}
            onPress={() => router.push('/(tabs)/transactions')}
          />
          <MenuItem
            icon="office-building-outline" label="Projects" C={C}
            onPress={() => router.push('/(tabs)/projects')}
          />
          <MenuItem
            icon="file-chart-outline" label="Reports & Downloads" C={C}
            onPress={() => router.push('/(tabs)/reports')}
          />
        </View>

        <View style={[styles.menuSection, { backgroundColor: C.card }]}>
          <Text style={[styles.menuSectionTitle, { color: C.textSecondary }]}>ACTIONS</Text>

          <MenuItem
            icon="bell-outline" label="Notifications" C={C}
            badge={unreadCount > 0 ? unreadCount : undefined}
            onPress={() => router.push('/notifications')}
          />
          <MenuItem
            icon="account-circle-outline" label="My Profile" C={C}
            onPress={() => router.push('/profile')}
          />
          {user?.role === 'admin' && (
            <MenuItem
              icon="shield-account-outline" label="Admin Panel" C={C}
              onPress={() => router.push('/admin')}
            />
          )}
        </View>

        <View style={[styles.menuSection, { backgroundColor: C.card }]}>
          <Text style={[styles.menuSectionTitle, { color: C.textSecondary }]}>SETTINGS</Text>

          <View style={[styles.menuItem, { borderBottomColor: C.border }]}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: isDarkMode ? Colors.warning + '20' : Colors.warning + '15' }]}>
                <MaterialCommunityIcons name="weather-night" size={20} color={Colors.warning} />
              </View>
              <Text style={[styles.menuItemLabel, { color: C.text }]}>Dark Mode</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: Colors.border, true: Colors.primary + '60' }}
              thumbColor={isDarkMode ? Colors.primary : '#fff'}
            />
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color={Colors.expense} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Vinyak Infratrack v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

function MenuItem({ icon, label, C, onPress, badge }: any) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, { borderBottomColor: C.border }]}
      onPress={onPress}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIcon, { backgroundColor: Colors.primary + '15' }]}>
          <MaterialCommunityIcons name={icon} size={20} color={Colors.primary} />
        </View>
        <Text style={[styles.menuItemLabel, { color: C.text }]}>{label}</Text>
      </View>
      <View style={styles.menuItemRight}>
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
        <MaterialCommunityIcons name="chevron-right" size={20} color={C.textSecondary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 52, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: '700', color: '#fff' },
  scroll: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 80 },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: Radius.md, padding: Spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarText: { fontSize: FontSize.xxl, fontWeight: '700', color: '#fff' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: FontSize.lg, fontWeight: '700' },
  profileEmail: { fontSize: FontSize.sm, marginTop: 2 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full, marginTop: 4, alignSelf: 'flex-start' },
  roleText: { fontSize: 10, fontWeight: '700' },
  menuSection: {
    borderRadius: Radius.md, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  menuSectionTitle: { fontSize: 11, fontWeight: '700', paddingHorizontal: Spacing.md, paddingTop: 12, paddingBottom: 4, letterSpacing: 0.5 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: 14, borderBottomWidth: 1,
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuItemRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuItemLabel: { fontSize: FontSize.md, fontWeight: '600' },
  badge: {
    backgroundColor: Colors.expense, width: 20, height: 20,
    borderRadius: 10, alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: 16, borderRadius: Radius.md,
    backgroundColor: Colors.expenseLight, borderWidth: 1, borderColor: Colors.expense + '40',
  },
  logoutText: { color: Colors.expense, fontSize: FontSize.md, fontWeight: '700' },
  version: { textAlign: 'center', color: Colors.textMuted, fontSize: FontSize.xs },
});
