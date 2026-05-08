import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Platform,
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppStore } from '../../store/appStore';
import { computeSummary } from '../../services/transactionService';
import { generatePDFHTML } from '../../utils/pdfTemplate';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { Colors, Spacing, FontSize, Radius } from '../../constants/Colors';
import { Transaction, ExpenseCategory, EXPENSE_CATEGORY_LABELS } from '../../constants/types';

type ReportType = 'summary' | 'project' | 'monthly' | 'category';

export default function ReportsScreen() {
  const { isDarkMode, transactions, projects } = useAppStore();
  const [reportType, setReportType] = useState<ReportType>('summary');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [generating, setGenerating] = useState(false);
  const C = isDarkMode ? Colors.dark : Colors.light;

  const filteredTx = transactions.filter((tx) =>
    selectedProject === 'all' ? true : tx.projectId === selectedProject
  );
  const { totalIncome, totalExpense, balance } = computeSummary(filteredTx);

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const projectName = selectedProject === 'all'
        ? 'All Projects'
        : projects.find((p) => p.id === selectedProject)?.name ?? 'All Projects';

      const html = generatePDFHTML({
        title: getTitleForType(reportType),
        subtitle: `${projectName} • ${new Date().toLocaleDateString('en-IN')}`,
        transactions: filteredTx,
        totalIncome,
        totalExpense,
        balance,
      });

      const { uri } = await Print.printToFileAsync({ html, base64: false });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Report',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('PDF Created', `Report saved to: ${uri}`);
      }
    } catch (e) {
      Alert.alert('Error', 'Could not generate PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const printReport = async () => {
    setGenerating(true);
    try {
      const html = generatePDFHTML({
        title: getTitleForType(reportType),
        transactions: filteredTx,
        totalIncome,
        totalExpense,
        balance,
      });
      await Print.printAsync({ html });
    } catch (e) {
      Alert.alert('Error', 'Could not print. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  // Category breakdown
  const categoryBreakdown = Object.entries(
    filteredTx
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => {
        const key = t.category ?? 'miscellaneous';
        acc[key] = (acc[key] ?? 0) + t.amount;
        return acc;
      }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1]);

  // Monthly breakdown
  const monthlyBreakdown = Object.entries(
    filteredTx.reduce((acc, t) => {
      const key = new Date(t.date).toISOString().slice(0, 7); // YYYY-MM
      if (!acc[key]) acc[key] = { income: 0, expense: 0 };
      acc[key][t.type] += t.amount;
      return acc;
    }, {} as Record<string, { income: number; expense: number }>)
  ).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 6);

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors.bgDark }]}>
        <Text style={styles.headerTitle}>Reports</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <MiniCard label="Income" value={formatCurrency(totalIncome)} color={Colors.income} C={C} />
          <MiniCard label="Expense" value={formatCurrency(totalExpense)} color={Colors.expense} C={C} />
          <MiniCard label="Balance" value={formatCurrency(balance)} color={Colors.info} C={C} />
        </View>

        {/* Project Filter */}
        <View style={[styles.section, { backgroundColor: C.card }]}>
          <Text style={[styles.sectionTitle, { color: C.text }]}>Filter by Project</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            <TouchableOpacity
              style={[styles.chip, selectedProject === 'all' && styles.chipActive]}
              onPress={() => setSelectedProject('all')}
            >
              <Text style={[styles.chipText, selectedProject === 'all' && styles.chipTextActive]}>All Projects</Text>
            </TouchableOpacity>
            {projects.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.chip, selectedProject === p.id && styles.chipActive]}
                onPress={() => setSelectedProject(p.id)}
              >
                <Text style={[styles.chipText, selectedProject === p.id && styles.chipTextActive]} numberOfLines={1}>
                  {p.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Category Breakdown */}
        {categoryBreakdown.length > 0 && (
          <View style={[styles.section, { backgroundColor: C.card }]}>
            <Text style={[styles.sectionTitle, { color: C.text }]}>Expense by Category</Text>
            {categoryBreakdown.map(([cat, amt]) => {
              const pct = totalExpense > 0 ? (amt / totalExpense) * 100 : 0;
              return (
                <View key={cat} style={styles.catRow}>
                  <Text style={[styles.catLabel, { color: C.text }]}>
                    {EXPENSE_CATEGORY_LABELS[cat as ExpenseCategory] ?? cat}
                  </Text>
                  <View style={styles.catBarWrapper}>
                    <View style={[styles.catBar, { width: `${pct}%` as any, backgroundColor: Colors.expense }]} />
                  </View>
                  <Text style={[styles.catAmt, { color: C.textSecondary }]}>{formatCurrency(amt)}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Monthly Summary */}
        {monthlyBreakdown.length > 0 && (
          <View style={[styles.section, { backgroundColor: C.card }]}>
            <Text style={[styles.sectionTitle, { color: C.text }]}>Monthly Summary (Last 6)</Text>
            {monthlyBreakdown.map(([month, data]) => (
              <View key={month} style={[styles.monthRow, { borderBottomColor: C.border }]}>
                <Text style={[styles.monthLabel, { color: C.text }]}>
                  {new Date(month + '-01').toLocaleString('default', { month: 'short', year: 'numeric' })}
                </Text>
                <Text style={{ color: Colors.income, fontWeight: '600' }}>+{formatCurrency(data.income)}</Text>
                <Text style={{ color: Colors.expense, fontWeight: '600' }}>-{formatCurrency(data.expense)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* PDF Actions */}
        <View style={[styles.section, { backgroundColor: C.card }]}>
          <Text style={[styles.sectionTitle, { color: C.text }]}>Download & Print</Text>
          <Text style={[styles.sectionSub, { color: C.textSecondary }]}>
            {filteredTx.length} transactions in current filter
          </Text>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.primary }]}
            onPress={generatePDF}
            disabled={generating}
          >
            {generating ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <MaterialCommunityIcons name="file-pdf-box" size={22} color="#fff" />
            )}
            <Text style={styles.actionBtnText}>Download PDF Report</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.bgDark }]}
            onPress={printReport}
            disabled={generating}
          >
            <MaterialCommunityIcons name="printer" size={22} color="#fff" />
            <Text style={styles.actionBtnText}>Print Report</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function MiniCard({ label, value, color, C }: any) {
  return (
    <View style={[styles.miniCard, { backgroundColor: C.card }]}>
      <Text style={[styles.miniValue, { color }]}>{value}</Text>
      <Text style={[styles.miniLabel, { color: C.textSecondary }]}>{label}</Text>
    </View>
  );
}

function getTitleForType(type: ReportType): string {
  const map: Record<ReportType, string> = {
    summary: 'Financial Summary Report',
    project: 'Project-wise Report',
    monthly: 'Monthly Report',
    category: 'Category-wise Expense Report',
  };
  return map[type];
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 52, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: '700', color: '#fff' },
  scroll: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 80 },
  summaryRow: { flexDirection: 'row', gap: 10 },
  miniCard: {
    flex: 1, borderRadius: Radius.md, padding: 12, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  miniValue: { fontSize: FontSize.lg, fontWeight: '700' },
  miniLabel: { fontSize: FontSize.xs, marginTop: 2, fontWeight: '600' },
  section: {
    borderRadius: Radius.md, padding: Spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', marginBottom: 12 },
  sectionSub: { fontSize: FontSize.sm, marginBottom: 12, marginTop: -8 },
  chipScroll: { marginBottom: 4 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full,
    backgroundColor: Colors.bgCardLight, borderWidth: 1, borderColor: Colors.border, marginRight: 8,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  chipTextActive: { color: '#fff' },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  catLabel: { fontSize: FontSize.sm, fontWeight: '600', width: 90 },
  catBarWrapper: { flex: 1, height: 8, backgroundColor: Colors.bgCardLight, borderRadius: 4, overflow: 'hidden' },
  catBar: { height: '100%', borderRadius: 4 },
  catAmt: { fontSize: FontSize.sm, width: 70, textAlign: 'right' },
  monthRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1,
  },
  monthLabel: { fontSize: FontSize.md, fontWeight: '600', flex: 1 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, padding: 16, borderRadius: Radius.md, marginBottom: 10,
  },
  actionBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700' },
});
