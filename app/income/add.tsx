import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { addTransaction } from '../../services/transactionService';
import { uploadFile, pickImage, takePhoto, pickDocument } from '../../services/storageService';
import { formatDate } from '../../utils/formatters';
import { Colors, Spacing, FontSize, Radius } from '../../constants/Colors';
import { PaymentMode, PAYMENT_MODE_LABELS } from '../../constants/types';

const PAYMENT_MODES: PaymentMode[] = ['cash', 'bank_transfer', 'upi', 'cheque'];

export default function AddIncomeScreen() {
  const { user } = useAuthStore();
  const { projects, isDarkMode } = useAppStore();
  const C = isDarkMode ? Colors.dark : Colors.light;
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [clientName, setClientName] = useState('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');
  const [notes, setNotes] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [attachment, setAttachment] = useState<{ uri: string; name: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const activeProjects = projects.filter((p) => p.status === 'active');

  const handlePickAttachment = () => {
    Alert.alert('Upload Receipt', 'Choose an option', [
      { text: 'Camera', onPress: async () => { const r = await takePhoto(); if (r) setAttachment(r); } },
      { text: 'Gallery', onPress: async () => { const r = await pickImage(); if (r) setAttachment(r); } },
      { text: 'Document', onPress: async () => { const r = await pickDocument(); if (r) setAttachment(r); } },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSubmit = async () => {
    setError('');
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) { setError('Please enter a valid amount.'); return; }
    if (!clientName.trim()) { setError('Please enter client / payment source name.'); return; }
    if (!selectedProjectId) { setError('Please select a project.'); return; }
    setLoading(true);
    try {
      let attachmentURL: string | null = null;
      if (attachment) {
        const url = await uploadFile(attachment.uri, 'receipts', attachment.name);
        if (url) attachmentURL = url;
      }
      const selectedProject = projects.find((p) => p.id === selectedProjectId)!;
      
      const payload: any = {
        type: 'income', amount: parseFloat(amount), date, projectId: selectedProjectId,
        projectName: selectedProject.name, paymentMode, clientOrVendor: clientName.trim(),
        notes: notes.trim(), addedBy: user!.uid, addedByName: user!.name,
      };
      if (attachmentURL) payload.attachmentURL = attachmentURL;

      await addTransaction(payload as any);
      Alert.alert('Income Added', 'Entry recorded successfully.', [
        { text: 'Add Another', onPress: () => { setAmount(''); setClientName(''); setNotes(''); setAttachment(null); setSelectedProjectId(''); } },
        { text: 'Done', onPress: () => router.back() },
      ]);
    } catch (e: any) { setError(e.message ?? 'Failed to save. Try again.'); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: C.bg }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { backgroundColor: Colors.income }]}>
        <TouchableOpacity onPress={() => router.back()}><MaterialCommunityIcons name="arrow-left" size={24} color="#fff" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Add Income</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: C.card }]}>
          <Text style={[styles.label, { color: C.text }]}>Amount (₹) *</Text>
          <TextInput mode="outlined" value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="0.00"
            left={<TextInput.Icon icon="currency-inr" />} style={styles.input} outlineColor={Colors.border} activeOutlineColor={Colors.income} />

          <Text style={[styles.label, { color: C.text }]}>Date *</Text>
          <TouchableOpacity style={[styles.dateBtn, { borderColor: Colors.border }]} onPress={() => setShowDate(true)}>
            <MaterialCommunityIcons name="calendar" size={20} color={Colors.income} />
            <Text style={{ color: C.text, fontSize: FontSize.md }}>{formatDate(date)}</Text>
          </TouchableOpacity>
          {showDate && <DateTimePicker value={date} mode="date" maximumDate={new Date()} onChange={(_, d) => { setShowDate(false); if (d) setDate(d); }} />}

          <Text style={[styles.label, { color: C.text }]}>Client / Payment Source *</Text>
          <TextInput mode="outlined" value={clientName} onChangeText={setClientName} placeholder="e.g. NHAI, PWD Dept"
            left={<TextInput.Icon icon="account-outline" />} style={styles.input} outlineColor={Colors.border} activeOutlineColor={Colors.income} />

          <Text style={[styles.label, { color: C.text }]}>Payment Mode *</Text>
          <View style={styles.chipRow}>
            {PAYMENT_MODES.map((mode) => (
              <TouchableOpacity key={mode} onPress={() => setPaymentMode(mode)}
                style={[styles.chip, paymentMode === mode && { backgroundColor: Colors.income, borderColor: Colors.income }]}>
                <Text style={[styles.chipText, paymentMode === mode && { color: '#fff' }]}>{PAYMENT_MODE_LABELS[mode]}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { color: C.text }]}>Select Project *</Text>
          {activeProjects.map((p) => (
            <TouchableOpacity key={p.id} onPress={() => setSelectedProjectId(p.id)}
              style={[styles.projectChip, selectedProjectId === p.id && { borderColor: Colors.income, backgroundColor: Colors.incomeLight }]}>
              <MaterialCommunityIcons name="office-building" size={16} color={selectedProjectId === p.id ? Colors.income : Colors.textSecondary} />
              <Text style={[styles.projectChipText, { color: selectedProjectId === p.id ? Colors.income : C.text }]} numberOfLines={1}>{p.name}</Text>
            </TouchableOpacity>
          ))}
          {activeProjects.length === 0 && <Text style={{ color: C.textSecondary, padding: 8 }}>No active projects found.</Text>}

          <Text style={[styles.label, { color: C.text }]}>Notes (Optional)</Text>
          <TextInput mode="outlined" value={notes} onChangeText={setNotes} placeholder="Additional details..." multiline numberOfLines={3}
            style={[styles.input, { height: 80 }]} outlineColor={Colors.border} activeOutlineColor={Colors.income} />

          <TouchableOpacity style={styles.uploadBtn} onPress={handlePickAttachment}>
            <MaterialCommunityIcons name={attachment ? 'paperclip' : 'camera-plus-outline'} size={22} color={Colors.income} />
            <Text style={{ color: Colors.income, fontWeight: '600', flex: 1 }} numberOfLines={1}>
              {attachment ? attachment.name : 'Upload Receipt / Screenshot (Optional)'}
            </Text>
            {attachment && <TouchableOpacity onPress={() => setAttachment(null)}><MaterialCommunityIcons name="close-circle" size={18} color={Colors.expense} /></TouchableOpacity>}
          </TouchableOpacity>

          {error ? (
            <View style={styles.errorBox}>
              <MaterialCommunityIcons name="alert-circle" size={16} color={Colors.expense} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Button mode="contained" onPress={handleSubmit} loading={loading} disabled={loading}
            style={styles.submitBtn} contentStyle={{ paddingVertical: 8 }} buttonColor={Colors.income} labelStyle={{ fontSize: FontSize.lg, fontWeight: '700' }}>
            Save Income Entry
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '700', color: '#fff' },
  scroll: { padding: Spacing.md, paddingBottom: 40 },
  card: { borderRadius: Radius.lg, padding: Spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3 },
  label: { fontSize: FontSize.md, fontWeight: '600', marginBottom: 6, marginTop: 14 },
  input: { marginBottom: 4, backgroundColor: 'transparent' },
  dateBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: Radius.sm, padding: 14 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border },
  chipText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  projectChip: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 12, borderRadius: Radius.sm, borderWidth: 1.5, borderColor: Colors.border, marginBottom: 6 },
  projectChipText: { fontSize: FontSize.md, fontWeight: '600', flex: 1 },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: Radius.sm, borderWidth: 1.5, borderColor: Colors.income + '60', borderStyle: 'dashed', backgroundColor: Colors.incomeLight, marginTop: 8 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.expenseLight, padding: 10, borderRadius: Radius.sm, marginTop: Spacing.sm },
  errorText: { color: Colors.expense, fontSize: FontSize.sm, flex: 1 },
  submitBtn: { borderRadius: Radius.md, marginTop: Spacing.lg },
});
