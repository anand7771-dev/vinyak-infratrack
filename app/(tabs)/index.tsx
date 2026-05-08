import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { subscribeToTransactions, computeSummary } from '../../services/transactionService';
import { subscribeToProjects } from '../../services/projectService';
import { formatCurrency, formatDate, formatTimeAgo } from '../../utils/formatters';
import { Colors, Spacing, FontSize, Radius } from '../../constants/Colors';
import { Transaction, Project } from '../../constants/types';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const { isDarkMode, projects, setProjects, transactions, setTransactions } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });

  const C = isDarkMode ? Colors.dark : Colors.light;

  useEffect(() => {
    const unsub1 = subscribeToProjects(setProjects);
    const unsub2 = subscribeToTransactions((txs) => {
      setTransactions(txs);
      setSummary(computeSummary(txs));
    });
    return () => { unsub1(); unsub2(); };
  }, []);

  const activeProjects = projects.filter((p) => p.status === 'active').length;
  const recent = transactions.slice(0, 5);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: Colors.bgDark }]}>
        <View>
          <Text style={styles.greeting}>Good {getGreeting()}, {user?.name?.split(' ')[0] ?? 'User'} 👋</Text>
          <Text style={styles.headerSub}>Vinyak Infratrack</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/notifications')}>
          <MaterialCommunityIcons name="bell-outline" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      >
        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <SummaryCard label="Total Income" value={formatCurrency(summary.totalIncome)}
            icon="trending-up" bg={Colors.incomeLight} iconColor={Colors.income} textColor={Colors.income} dark={isDarkMode} />
          <SummaryCard label="Total Expense" value={formatCurrency(summary.totalExpense)}
            icon="trending-down" bg={Colors.expenseLight} iconColor={Colors.expense} textColor={Colors.expense} dark={isDarkMode} />
          <SummaryCard label="Balance" value={formatCurrency(summary.balance)}
            icon="wallet" bg={Colors.infoLight} iconColor={Colors.info} textColor={Colors.info} dark={isDarkMode} />
          <SummaryCard label="Active Projects" value={String(activeProjects)}
            icon="office-building-outline" bg={Colors.warningLight} iconColor={Colors.warning} textColor={Colors.warning} dark={isDarkMode} />
        </View>

        {/* Quick Actions */}
        <View style={[styles.section, { backgroundColor: C.card }]}>
          <Text style={[styles.sectionTitle, { color: C.text }]}>Quick Actions</Text>
          <View style={styles.actionRow}>
            <QuickAction icon="plus-circle" label="Add Income" color={Colors.income}
              onPress={() => router.push('/income/add')} />
            <QuickAction icon="minus-circle" label="Add Expense" color={Colors.expense}
              onPress={() => router.push('/expense/add')} />
            <QuickAction icon="folder-plus" label="New Project" color={Colors.info}
              onPress={() => router.push('/project/add')} />
            <QuickAction icon="file-chart" label="Reports" color={Colors.warning}
              onPress={() => router.push('/(tabs)/reports')} />
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={[styles.section, { backgroundColor: C.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: C.text }]}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {recent.length === 0 ? (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="receipt" size={40} color={C.textSecondary} />
              <Text style={[styles.emptyText, { color: C.textSecondary }]}>No transactions yet</Text>
            </View>
          ) : (
            recent.map((tx) => <TxItem key={tx.id} tx={tx} C={C} />)
          )}
        </View>

        {/* Projects Summary */}
        <View style={[styles.section, { backgroundColor: C.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: C.text }]}>Projects</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/projects')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {projects.slice(0, 3).map((p) => <ProjectRow key={p.id} project={p} C={C} />)}
          {projects.length === 0 && (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="office-building-outline" size={40} color={C.textSecondary} />
              <Text style={[styles.emptyText, { color: C.textSecondary }]}>No projects yet</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function SummaryCard({ label, value, icon, bg, iconColor, textColor, dark }: any) {
  return (
    <View style={[styles.summaryCard, { backgroundColor: dark ? Colors.dark.surface : bg }]}>
      <MaterialCommunityIcons name={icon} size={24} color={iconColor} />
      <Text style={[styles.summaryValue, { color: textColor }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function QuickAction({ icon, label, color, onPress }: any) {
  return (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
      <View style={[styles.actionIcon, { backgroundColor: color + '18' }]}>
        <MaterialCommunityIcons name={icon} size={26} color={color} />
      </View>
      <Text style={[styles.actionLabel, { color: Colors.textSecondary }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function TxItem({ tx, C }: { tx: Transaction; C: any }) {
  const isIncome = tx.type === 'income';
  return (
    <View style={[styles.txItem, { borderBottomColor: C.border }]}>
      <View style={[styles.txIcon, { backgroundColor: isIncome ? Colors.incomeLight : Colors.expenseLight }]}>
        <MaterialCommunityIcons
          name={isIncome ? 'arrow-down-circle' : 'arrow-up-circle'}
          size={22} color={isIncome ? Colors.income : Colors.expense}
        />
      </View>
      <View style={styles.txInfo}>
        <Text style={[styles.txParty, { color: C.text }]} numberOfLines={1}>{tx.clientOrVendor}</Text>
        <Text style={[styles.txMeta, { color: C.textSecondary }]}>{tx.projectName} • {formatDate(tx.date)}</Text>
      </View>
      <Text style={[styles.txAmount, { color: isIncome ? Colors.income : Colors.expense }]}>
        {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
      </Text>
    </View>
  );
}

function ProjectRow({ project, C }: { project: Project; C: any }) {
  return (
    <TouchableOpacity
      style={[styles.projectRow, { borderBottomColor: C.border }]}
      onPress={() => router.push(`/project/${project.id}`)}
    >
      <View style={[styles.projectDot, {
        backgroundColor: project.status === 'active' ? Colors.income :
          project.status === 'completed' ? Colors.info : Colors.warning,
      }]} />
      <View style={styles.projectInfo}>
        <Text style={[styles.projectName, { color: C.text }]} numberOfLines={1}>{project.name}</Text>
        <Text style={[styles.projectMeta, { color: C.textSecondary }]}>{project.location}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color={C.textSecondary} />
    </TouchableOpacity>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 52, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md,
  },
  greeting: { fontSize: FontSize.lg, fontWeight: '700', color: '#fff' },
  headerSub: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
  scroll: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 80 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  summaryCard: {
    width: (width - Spacing.md * 2 - 12) / 2, borderRadius: Radius.md,
    padding: Spacing.md, gap: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  summaryValue: { fontSize: FontSize.xl, fontWeight: '700' },
  summaryLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '600' },
  section: {
    borderRadius: Radius.md, padding: Spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700' },
  seeAll: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: { alignItems: 'center', gap: 6, flex: 1 },
  actionIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 10, fontWeight: '600', textAlign: 'center' },
  txItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, borderBottomWidth: 1,
  },
  txIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  txInfo: { flex: 1 },
  txParty: { fontSize: FontSize.md, fontWeight: '600' },
  txMeta: { fontSize: FontSize.xs, marginTop: 2 },
  txAmount: { fontSize: FontSize.md, fontWeight: '700' },
  projectRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, borderBottomWidth: 1,
  },
  projectDot: { width: 10, height: 10, borderRadius: 5 },
  projectInfo: { flex: 1 },
  projectName: { fontSize: FontSize.md, fontWeight: '600' },
  projectMeta: { fontSize: FontSize.xs, marginTop: 2 },
  empty: { alignItems: 'center', padding: Spacing.lg, gap: 8 },
  emptyText: { fontSize: FontSize.md },
});
