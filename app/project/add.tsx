import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { addProject } from '../../services/projectService';
import { formatDate } from '../../utils/formatters';
import { Colors, Spacing, FontSize, Radius } from '../../constants/Colors';
import { ProjectType, ProjectStatus } from '../../constants/types';

const PROJECT_TYPES: { value: ProjectType; label: string; icon: string }[] = [
  { value: 'road', label: 'Road', icon: 'road' },
  { value: 'bridge', label: 'Bridge', icon: 'bridge' },
  { value: 'building', label: 'Building', icon: 'office-building' },
];

export default function AddProjectScreen() {
  const { user } = useAuthStore();
  const { isDarkMode } = useAppStore();
  const C = isDarkMode ? Colors.dark : Colors.light;
  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState<ProjectType>('road');
  const [startDate, setStartDate] = useState(new Date());
  const [showStartDate, setShowStartDate] = useState(false);
  const [contractAmount, setContractAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!name.trim()) { setError('Project name is required.'); return; }
    if (!clientName.trim()) { setError('Client name is required.'); return; }
    if (!location.trim()) { setError('Location is required.'); return; }
    if (!contractAmount || isNaN(parseFloat(contractAmount))) { setError('Please enter a valid contract amount.'); return; }
    setLoading(true);
    try {
      await addProject({
        name: name.trim(), clientName: clientName.trim(), location: location.trim(),
        type, startDate, status: 'active', contractAmount: parseFloat(contractAmount),
        notes: notes.trim(), createdBy: user!.uid, createdByName: user!.name,
      });
      Alert.alert('Project Created', `"${name}" has been created successfully.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) { setError('Failed to create project. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: C.bg }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { backgroundColor: Colors.bgDark }]}>
        <TouchableOpacity onPress={() => router.back()}><MaterialCommunityIcons name="arrow-left" size={24} color="#fff" /></TouchableOpacity>
        <Text style={styles.headerTitle}>New Project</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: C.card }]}>
          <Text style={[styles.label, { color: C.text }]}>Project Name *</Text>
          <TextInput mode="outlined" value={name} onChangeText={setName} placeholder="e.g. NH-44 Road Widening"
            left={<TextInput.Icon icon="hard-hat" />} style={styles.input} outlineColor={Colors.border} activeOutlineColor={Colors.primary} />

          <Text style={[styles.label, { color: C.text }]}>Client Name *</Text>
          <TextInput mode="outlined" value={clientName} onChangeText={setClientName} placeholder="e.g. NHAI, PWD, CPWD"
            left={<TextInput.Icon icon="account-outline" />} style={styles.input} outlineColor={Colors.border} activeOutlineColor={Colors.primary} />

          <Text style={[styles.label, { color: C.text }]}>Location / Site *</Text>
          <TextInput mode="outlined" value={location} onChangeText={setLocation} placeholder="e.g. Bhubaneswar, Odisha"
            left={<TextInput.Icon icon="map-marker-outline" />} style={styles.input} outlineColor={Colors.border} activeOutlineColor={Colors.primary} />

          <Text style={[styles.label, { color: C.text }]}>Project Type *</Text>
          <View style={styles.typeRow}>
            {PROJECT_TYPES.map((t) => (
              <TouchableOpacity key={t.value} onPress={() => setType(t.value)}
                style={[styles.typeChip, type === t.value && { backgroundColor: Colors.primary, borderColor: Colors.primary }]}>
                <MaterialCommunityIcons name={t.icon as any} size={20} color={type === t.value ? '#fff' : Colors.textSecondary} />
                <Text style={[styles.typeChipText, type === t.value && { color: '#fff' }]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { color: C.text }]}>Start Date *</Text>
          <TouchableOpacity style={[styles.dateBtn, { borderColor: Colors.border }]} onPress={() => setShowStartDate(true)}>
            <MaterialCommunityIcons name="calendar" size={20} color={Colors.primary} />
            <Text style={{ color: C.text, fontSize: FontSize.md }}>{formatDate(startDate)}</Text>
          </TouchableOpacity>
          {showStartDate && <DateTimePicker value={startDate} mode="date" onChange={(_, d) => { setShowStartDate(false); if (d) setStartDate(d); }} />}

          <Text style={[styles.label, { color: C.text }]}>Contract Amount (₹) *</Text>
          <TextInput mode="outlined" value={contractAmount} onChangeText={setContractAmount} keyboardType="numeric" placeholder="Total contract value"
            left={<TextInput.Icon icon="currency-inr" />} style={styles.input} outlineColor={Colors.border} activeOutlineColor={Colors.primary} />

          <Text style={[styles.label, { color: C.text }]}>Notes (Optional)</Text>
          <TextInput mode="outlined" value={notes} onChangeText={setNotes} placeholder="Project description, scope of work..." multiline numberOfLines={3}
            style={[styles.input, { height: 80 }]} outlineColor={Colors.border} activeOutlineColor={Colors.primary} />

          {error ? (
            <View style={styles.errorBox}>
              <MaterialCommunityIcons name="alert-circle" size={16} color={Colors.expense} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Button mode="contained" onPress={handleSubmit} loading={loading} disabled={loading}
            style={styles.submitBtn} contentStyle={{ paddingVertical: 8 }} buttonColor={Colors.primary} labelStyle={{ fontSize: FontSize.lg, fontWeight: '700' }}>
            Create Project
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
  typeRow: { flexDirection: 'row', gap: 10 },
  typeChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: Radius.sm, borderWidth: 1.5, borderColor: Colors.border },
  typeChipText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.expenseLight, padding: 10, borderRadius: Radius.sm, marginTop: Spacing.sm },
  errorText: { color: Colors.expense, fontSize: FontSize.sm, flex: 1 },
  submitBtn: { borderRadius: Radius.md, marginTop: Spacing.lg },
});
