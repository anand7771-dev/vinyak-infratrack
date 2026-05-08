import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { getProject, deleteProject, updateProject } from '../../services/projectService';
import { subscribeToProjectTransactions, computeSummary } from '../../services/transactionService';
import { formatCurrency, formatCurrencyFull, formatDate } from '../../utils/formatters';
import { Colors, Spacing, FontSize, Radius } from '../../constants/Colors';
import { Project, Transaction, PROJECT_TYPE_LABELS, PROJECT_STATUS_LABELS } from '../../constants/types';

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { isDarkMode } = useAppStore();
  const C = isDarkMode ? Colors.dark : Colors.light;
  const [project, setProject] = useState<Project | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getProject(id).then((p) => { setProject(p); setLoading(false); });
    const unsub = subscribeToProjectTransactions(id, setTransactions);
    return unsub;
  }, [id]);

  const summary = computeSummary(transactions);
  const isAdmin = user?.role === 'admin';

  const handleStatusChange = async (status: 'active' | 'completed' | 'on-hold') => {
    if (!id) return;
    await updateProject(id, { status });
    setProject((p) => p ? { ...p, status } : null);
  };

  const handleDelete = () => {
    Alert.alert('Delete Project', 'This will delete the project. Transactions will remain.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteProject(id!); router.back(); } },
    ]);
  };

  if (loading) return (
    <View style={[styles.container, { backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }]}>
      <Text style={{ color: C.text }}>Loading...</Text>
    </View>
  );
  if (!project) return (
    <View style={[styles.container, { backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }]}>
      <Text style={{ color: C.text }}>Project not found.</Text>
    </View>
  );

  const statusColor = { active: Colors.income, completed: Colors.info, 'on-hold': Colors.warning }[project.status];

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      <View style={[styles.header, { backgroundColor: Colors.bgDark }]}>
        <TouchableOpacity onPress={() => router.back()}><MaterialCommunityIcons name="arrow-left" size={24} color="#fff" /></TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{project.name}</Text>
        {isAdmin ? (
          <TouchableOpacity onPress={handleDelete}><MaterialCommunityIcons name="delete-outline" size={24} color="#ff6b6b" /></TouchableOpacity>
        ) : <View style={{ width: 40 }} />}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Status & Info */}
        <View style={[styles.card, { backgroundColor: C.card }]}>
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{PROJECT_STATUS_LABELS[project.status]}</Text>
            </View>
            <Text style={[styles.projectType, { color: C.textSecondary }]}>{PROJECT_TYPE_LABELS[project.type]}</Text>
          </View>
          <InfoRow icon="account-outline" label="Client" value={project.clientName} C={C} />
          <InfoRow icon="map-marker-outline" label="Location" value={project.location} C={C} />
          <InfoRow icon="calendar-start" label="Start Date" value={formatDate(project.startDate)} C={C} />
          <InfoRow icon="currency-inr" label="Contract Amount" value={formatCurrencyFull(project.contractAmount)} C={C} />
          {project.notes ? <InfoRow icon="note-text-outline" label="Notes" value={project.notes} C={C} /> : null}
        </View>

        {/* Financial Summary */}
        <View style={styles.summaryRow}>
          <SummaryMini label="Income" value={formatCurrency(summary.totalIncome)} color={Colors.income} C={C} />
          <SummaryMini label="Expense" value={formatCurrency(summary.totalExpense)} color={Colors.expense} C={C} />
          <SummaryMini label="Balance" value={formatCurrency(summary.balance)} color={Colors.info} C={C} />
        </View>

        {/* Status Change (Admin only) */}
        {isAdmin && (
          <View style={[styles.card, { backgroundColor: C.card }]}>
            <Text style={[styles.cardTitle, { color: C.text }]}>Change Status</Text>
            <View style={styles.statusBtnsRow}>
              {(['active', 'completed', 'on-hold'] as const).map((s) => (
                <TouchableOpacity key={s} onPress={() => handleStatusChange(s)}
                  style={[styles.statusBtn, project.status === s && { backgroundColor: statusColor }]}>
                  <Text style={[styles.statusBtnText, project.status === s && { color: '#fff' }]}>
                    {PROJECT_STATUS_LABELS[s]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.income }]}
            onPress={() => router.push('/income/add')}>
            <MaterialCommunityIcons name="plus-circle" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>Add Income</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.expense }]}
            onPress={() => router.push('/expense/add')}>
            <MaterialCommunityIcons name="minus-circle" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>Add Expense</Text>
          </TouchableOpacity>
        </View>

        {/* Transactions */}
        <View style={[styles.card, { backgroundColor: C.card }]}>
          <Text style={[styles.cardTitle, { color: C.text }]}>Transactions ({transactions.length})</Text>
          {transactions.slice(0, 20).map((tx) => (
            <View key={tx.id} style={[styles.txRow, { borderBottomColor: C.border }]}>
              <View style={[styles.txDot, { backgroundColor: tx.type === 'income' ? Colors.income : Colors.expense }]} />
              <View style={styles.txInfo}>
                <Text style={[styles.txParty, { color: C.text }]} numberOfLines={1}>{tx.clientOrVendor}</Text>
                <Text style={[styles.txDate, { color: C.textSecondary }]}>{formatDate(tx.date)}</Text>
              </View>
              <Text style={[styles.txAmt, { color: tx.type === 'income' ? Colors.income : Colors.expense }]}>
                {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
              </Text>
            </View>
          ))}
          {transactions.length === 0 && (
            <Text style={[styles.emptyText, { color: C.textSecondary }]}>No transactions for this project yet.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({ icon, label, value, C }: any) {
  return (
    <View style={styles.infoRow}>
      <MaterialCommunityIcons name={icon} size={18} color={Colors.primary} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: FontSize.xs, color: C.textSecondary, fontWeight: '600' }}>{label}</Text>
        <Text style={{ fontSize: FontSize.md, color: C.text, marginTop: 1 }}>{value}</Text>
      </View>
    </View>
  );
}

function SummaryMini({ label, value, color, C }: any) {
  return (
    <View style={[styles.miniCard, { backgroundColor: C.card }]}>
      <Text style={[styles.miniValue, { color }]}>{value}</Text>
      <Text style={[styles.miniLabel, { color: C.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '700', color: '#fff', flex: 1, textAlign: 'center', marginHorizontal: 8 },
  scroll: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 40 },
  card: { borderRadius: Radius.md, padding: Spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3 },
  cardTitle: { fontSize: FontSize.lg, fontWeight: '700', marginBottom: 12 },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.full },
  statusText: { fontSize: FontSize.sm, fontWeight: '700' },
  projectType: { fontSize: FontSize.sm, fontWeight: '600' },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  summaryRow: { flexDirection: 'row', gap: 10 },
  miniCard: { flex: 1, borderRadius: Radius.md, padding: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3 },
  miniValue: { fontSize: FontSize.lg, fontWeight: '700' },
  miniLabel: { fontSize: FontSize.xs, marginTop: 2, fontWeight: '600' },
  statusBtnsRow: { flexDirection: 'row', gap: 8 },
  statusBtn: { flex: 1, paddingVertical: 10, borderRadius: Radius.sm, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  statusBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: Radius.md },
  actionBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700' },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1 },
  txDot: { width: 10, height: 10, borderRadius: 5 },
  txInfo: { flex: 1 },
  txParty: { fontSize: FontSize.md, fontWeight: '600' },
  txDate: { fontSize: FontSize.xs, marginTop: 2 },
  txAmt: { fontSize: FontSize.md, fontWeight: '700' },
  emptyText: { textAlign: 'center', padding: 16, fontSize: FontSize.md },
});
