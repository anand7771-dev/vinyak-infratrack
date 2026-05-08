import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, query, orderBy, limit, onSnapshot, updateDoc, doc, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import { Colors, Spacing, FontSize, Radius } from '../constants/Colors';
import { AppNotification } from '../constants/types';
import { formatTimeAgo, toDate } from '../utils/formatters';

const NOTIF_ICONS: Record<string, string> = {
  income: 'cash-plus', expense: 'cash-minus', project: 'office-building-plus', report: 'file-chart', general: 'bell',
};
const NOTIF_COLORS: Record<string, string> = {
  income: Colors.income, expense: Colors.expense, project: Colors.primary, report: Colors.info, general: Colors.warning,
};

export default function NotificationsScreen() {
  const { user } = useAuthStore();
  const { isDarkMode, setUnreadCount } = useAppStore();
  const C = isDarkMode ? Colors.dark : Colors.light;
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      const notifs = snap.docs.map((d) => ({
        ...d.data(), id: d.id, createdAt: toDate(d.data().createdAt),
      } as AppNotification));
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n) => !n.read).length);
    });
    return unsub;
  }, []);

  const markRead = async (id: string) => {
    await updateDoc(doc(db, 'notifications', id), { read: true });
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    await Promise.all(unread.map((n) => updateDoc(doc(db, 'notifications', n.id), { read: true })));
  };

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      <View style={[styles.header, { backgroundColor: Colors.bgDark }]}>
        <TouchableOpacity onPress={() => router.back()}><MaterialCommunityIcons name="arrow-left" size={24} color="#fff" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={markAllRead}>
          <Text style={styles.markAll}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.notifCard, { backgroundColor: item.read ? C.card : (isDarkMode ? Colors.dark.surface : '#FFF8F5') }, !item.read && { borderLeftColor: Colors.primary, borderLeftWidth: 3 }]}
            onPress={() => markRead(item.id)}
          >
            <View style={[styles.notifIcon, { backgroundColor: NOTIF_COLORS[item.type] + '20' }]}>
              <MaterialCommunityIcons name={NOTIF_ICONS[item.type] as any} size={22} color={NOTIF_COLORS[item.type]} />
            </View>
            <View style={styles.notifInfo}>
              <Text style={[styles.notifMsg, { color: C.text }]}>{item.message}</Text>
              <Text style={[styles.notifTime, { color: C.textSecondary }]}>{formatTimeAgo(item.createdAt)}</Text>
            </View>
            {!item.read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="bell-off-outline" size={56} color={C.textSecondary} />
            <Text style={[styles.emptyTitle, { color: C.text }]}>No Notifications</Text>
            <Text style={[styles.emptyText, { color: C.textSecondary }]}>You'll see updates about income, expenses and projects here.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '700', color: '#fff' },
  markAll: { color: Colors.primaryLight, fontSize: FontSize.sm, fontWeight: '600' },
  list: { padding: Spacing.md, gap: 8, paddingBottom: 40 },
  notifCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: Radius.md, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  notifIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  notifInfo: { flex: 1 },
  notifMsg: { fontSize: FontSize.md, fontWeight: '600', lineHeight: 20 },
  notifTime: { fontSize: FontSize.xs, marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: '700' },
  emptyText: { fontSize: FontSize.md, textAlign: 'center', paddingHorizontal: Spacing.xl },
});
