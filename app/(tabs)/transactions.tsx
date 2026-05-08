import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput as RNTextInput, Alert,
} from 'react-native';
import { FAB, Menu, Divider } from 'react-native-paper';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { subscribeToTransactions, deleteTransaction } from '../../services/transactionService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Colors, Spacing, FontSize, Radius } from '../../constants/Colors';
import { Transaction, TransactionType } from '../../constants/types';

const TYPE_FILTERS: { label: string; value: TransactionType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Income', value: 'income' },
  { label: 'Expense', value: 'expense' },
];

export default function TransactionsScreen() {
  const { isDarkMode, transactions, setTransactions, projects } = useAppStore();
  const { user } = useAuthStore();
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const C = isDarkMode ? Colors.dark : Colors.light;

  useEffect(() => {
    const unsub = subscribeToTransactions(setTransactions, 200);
    return unsub;
  }, []);

  const filtered = transactions.filter((tx) => {
    const matchType = typeFilter === 'all' || tx.type === typeFilter;
    const matchProject = projectFilter === 'all' || tx.projectId === projectFilter;
    const matchSearch =
      tx.clientOrVendor.toLowerCase().includes(search.toLowerCase()) ||
      tx.projectName.toLowerCase().includes(search.toLowerCase()) ||
      (tx.notes ?? '').toLowerCase().includes(search.toLowerCase());
    return matchType && matchProject && matchSearch;
  });

  const totalIncome = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors.bgDark }]}>
        <Text style={styles.headerTitle}>Ledger</Text>
        <View style={styles.headerStats}>
          <Text style={[styles.headerStat, { color: '#4CAF50' }]}>+{formatCurrency(totalIncome)}</Text>
          <Text style={styles.headerStatSep}>|</Text>
          <Text style={[styles.headerStat, { color: '#EF5350' }]}>-{formatCurrency(totalExpense)}</Text>
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchBox, { backgroundColor: C.card, borderColor: C.border }]}>
        <MaterialCommunityIcons name="magnify" size={20} color={C.textSecondary} />
        <RNTextInput
          style={[styles.searchInput, { color: C.text }]}
          placeholder="Search transactions..."
          placeholderTextColor={C.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Type Filter */}
      <View style={styles.filterRow}>
        {TYPE_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterChip, typeFilter === f.value && styles.filterChipActive]}
            onPress={() => setTypeFilter(f.value)}
          >
            <Text style={[styles.filterChipText, typeFilter === f.value && styles.filterChipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Project Filter */}
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <TouchableOpacity
              style={[styles.filterChip, projectFilter !== 'all' && styles.filterChipActive]}
              onPress={() => setMenuVisible(true)}
            >
              <MaterialCommunityIcons name="filter" size={14} color={projectFilter !== 'all' ? '#fff' : Colors.textSecondary} />
              <Text style={[styles.filterChipText, projectFilter !== 'all' && styles.filterChipTextActive]}>
                {projectFilter === 'all' ? 'Project' : projects.find((p) => p.id === projectFilter)?.name?.slice(0, 10) ?? 'Project'}
              </Text>
            </TouchableOpacity>
          }
        >
          <Menu.Item title="All Projects" onPress={() => { setProjectFilter('all'); setMenuVisible(false); }} />
          <Divider />
          {projects.map((p) => (
            <Menu.Item
              key={p.id}
              title={p.name}
              onPress={() => { setProjectFilter(p.id); setMenuVisible(false); }}
            />
          ))}
        </Menu>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <TxCard tx={item} C={C} userRole={user?.role} userId={user?.uid} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="receipt-text-outline" size={56} color={C.textSecondary} />
            <Text style={[styles.emptyTitle, { color: C.text }]}>No Transactions</Text>
            <Text style={[styles.emptyText, { color: C.textSecondary }]}>Add income or expense entries to see them here</Text>
          </View>
        }
      />

      <View style={styles.fabRow}>
        <FAB
          icon="arrow-down-circle"
          label="Income"
          size="small"
          style={[styles.fab, { backgroundColor: Colors.income }]}
          color="#fff"
          onPress={() => router.push('/income/add')}
        />
        <FAB
          icon="arrow-up-circle"
          label="Expense"
          size="small"
          style={[styles.fab, { backgroundColor: Colors.expense }]}
          color="#fff"
          onPress={() => router.push('/expense/add')}
        />
      </View>
    </View>
  );
}

function TxCard({ tx, C, userRole, userId }: { tx: Transaction; C: any; userRole?: string; userId?: string }) {
  const isIncome = tx.type === 'income';
  const canDelete = userRole === 'admin' || tx.addedBy === userId;

  const handleDelete = () => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this entry? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            try {
              await deleteTransaction(tx.id);
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.txCard, { backgroundColor: C.card }]}>
      <View style={styles.txTop}>
        <View style={[styles.txIcon, { backgroundColor: isIncome ? Colors.incomeLight : Colors.expenseLight }]}>
          <MaterialCommunityIcons
            name={isIncome ? 'arrow-down-circle' : 'arrow-up-circle'}
            size={24} color={isIncome ? Colors.income : Colors.expense}
          />
        </View>
        <View style={styles.txInfo}>
          <Text style={[styles.txParty, { color: C.text }]} numberOfLines={1}>{tx.clientOrVendor}</Text>
          <Text style={[styles.txProject, { color: C.textSecondary }]} numberOfLines={1}>{tx.projectName}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.txAmount, { color: isIncome ? Colors.income : Colors.expense }]}>
            {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
          </Text>
          {canDelete && (
            <TouchableOpacity onPress={handleDelete} style={{ marginTop: 8, padding: 4 }}>
              <MaterialCommunityIcons name="trash-can-outline" size={20} color={Colors.expense} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.txMeta}>
        <MetaTag icon="calendar" label={formatDate(tx.date)} C={C} />
        <MetaTag icon="swap-horizontal" label={tx.paymentMode.replace('_', ' ')} C={C} />
        {tx.category && <MetaTag icon="tag" label={tx.category} C={C} />}
        <MetaTag icon="account" label={tx.addedByName} C={C} />
        {tx.attachmentURL && <MetaTag icon="paperclip" label="Attachment" C={C} />}
      </View>

      {tx.notes ? <Text style={[styles.txNotes, { color: C.textSecondary }]} numberOfLines={2}>{tx.notes}</Text> : null}
    </View>
  );
}

function MetaTag({ icon, label, C }: any) {
  return (
    <View style={styles.metaTag}>
      <MaterialCommunityIcons name={icon} size={11} color={C.textSecondary} />
      <Text style={[styles.metaTagText, { color: C.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 52, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md,
  },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: '700', color: '#fff' },
  headerStats: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  headerStat: { fontSize: FontSize.sm, fontWeight: '600' },
  headerStatSep: { color: Colors.textMuted, fontSize: FontSize.sm },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    margin: Spacing.md, marginBottom: 8, paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: Radius.md, borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: FontSize.md },
  filterRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.md,
    gap: 8, marginBottom: 8, flexWrap: 'wrap',
  },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full,
    backgroundColor: Colors.bgCardLight, borderWidth: 1, borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  filterChipTextActive: { color: '#fff' },
  list: { padding: Spacing.md, gap: 10, paddingBottom: 100 },
  txCard: {
    borderRadius: Radius.md, padding: Spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  txTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  txIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  txInfo: { flex: 1 },
  txParty: { fontSize: FontSize.md, fontWeight: '700' },
  txProject: { fontSize: FontSize.sm, marginTop: 2 },
  txAmount: { fontSize: FontSize.lg, fontWeight: '700' },
  txMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  metaTag: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.bgCardLight, paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: Radius.full,
  },
  metaTagText: { fontSize: 10, fontWeight: '500' },
  txNotes: { fontSize: FontSize.sm, fontStyle: 'italic', marginTop: 4 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: '700' },
  emptyText: { fontSize: FontSize.md, textAlign: 'center' },
  fabRow: {
    position: 'absolute', right: Spacing.md, bottom: 80,
    gap: 8,
  },
  fab: { elevation: 4 },
});
