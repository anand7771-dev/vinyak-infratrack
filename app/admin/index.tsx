import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, onSnapshot, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { updateUserProfile } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { Colors, Spacing, FontSize, Radius } from '../../constants/Colors';
import { AppUser } from '../../constants/types';

export default function AdminScreen() {
  const { user } = useAuthStore();
  const { isDarkMode } = useAppStore();
  const C = isDarkMode ? Colors.dark : Colors.light;
  const [users, setUsers] = useState<AppUser[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setUsers(snap.docs.map((d) => ({ ...d.data(), uid: d.id, createdAt: d.data().createdAt?.toDate?.() ?? new Date() } as AppUser)));
    });
    return unsub;
  }, []);

  if (user?.role !== 'admin') {
    return (
      <View style={[styles.container, { backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }]}>
        <MaterialCommunityIcons name="lock" size={48} color={Colors.expense} />
        <Text style={[styles.noAccess, { color: C.text }]}>Admin access only</Text>
      </View>
    );
  }

  const ROLE_COLORS: Record<string, string> = { admin: Colors.primary, partner: Colors.info, staff: Colors.warning };

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      <View style={[styles.header, { backgroundColor: Colors.bgDark }]}>
        <TouchableOpacity onPress={() => router.back()}><MaterialCommunityIcons name="arrow-left" size={24} color="#fff" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={[styles.statRow, { backgroundColor: Colors.bgDark, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md }]}>
        <StatChip label="Total Users" value={String(users.length)} color="#fff" />
        <StatChip label="Admins" value={String(users.filter((u) => u.role === 'admin').length)} color={Colors.primaryLight} />
        <StatChip label="Partners" value={String(users.filter((u) => u.role === 'partner').length)} color={Colors.infoLight ?? '#64B5F6'} />
        <StatChip label="Staff" value={String(users.filter((u) => u.role === 'staff').length)} color={Colors.warningLight ?? '#FFD54F'} />
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.uid}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.userCard, { backgroundColor: C.card }]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: C.text }]}>{item.name}</Text>
              <Text style={[styles.userEmail, { color: C.textSecondary }]} numberOfLines={1}>{item.email}</Text>
              <Text style={[styles.userMobile, { color: C.textSecondary }]}>{item.mobile}</Text>
            </View>
            <View style={[styles.roleBadge, { backgroundColor: ROLE_COLORS[item.role] + '20' }]}>
              <Text style={[styles.roleText, { color: ROLE_COLORS[item.role] }]}>{item.role.toUpperCase()}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={[styles.emptyText, { color: C.textSecondary }]}>No users found.</Text>}
      />
    </View>
  );
}

function StatChip({ label, value, color }: any) {
  return (
    <View style={styles.statChip}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '700', color: '#fff' },
  statRow: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 4 },
  statChip: { alignItems: 'center' },
  statValue: { fontSize: FontSize.xl, fontWeight: '700' },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '600' },
  list: { padding: Spacing.md, gap: 10 },
  userCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: Radius.md, padding: Spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: FontSize.lg, fontWeight: '700' },
  userInfo: { flex: 1 },
  userName: { fontSize: FontSize.md, fontWeight: '700' },
  userEmail: { fontSize: FontSize.sm, marginTop: 2 },
  userMobile: { fontSize: FontSize.sm },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  roleText: { fontSize: 10, fontWeight: '700' },
  noAccess: { fontSize: FontSize.xl, fontWeight: '700', marginTop: 12 },
  emptyText: { textAlign: 'center', padding: 20, fontSize: FontSize.md },
});
