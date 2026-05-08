import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput as RNTextInput,
} from 'react-native';
import { FAB, Chip } from 'react-native-paper';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { subscribeToProjects } from '../../services/projectService';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { Colors, Spacing, FontSize, Radius } from '../../constants/Colors';
import { Project, ProjectStatus } from '../../constants/types';

const STATUS_FILTERS: { label: string; value: ProjectStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'On Hold', value: 'on-hold' },
];

const STATUS_COLORS: Record<ProjectStatus, string> = {
  active: Colors.income,
  completed: Colors.info,
  'on-hold': Colors.warning,
};

const TYPE_ICONS: Record<string, string> = {
  road: 'road',
  bridge: 'bridge',
  building: 'office-building',
};

export default function ProjectsScreen() {
  const { isDarkMode, projects, setProjects } = useAppStore();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<ProjectStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const C = isDarkMode ? Colors.dark : Colors.light;

  useEffect(() => {
    const unsub = subscribeToProjects(setProjects);
    return unsub;
  }, []);

  const canAdd = user?.role === 'admin' || user?.role === 'partner';

  const filtered = projects.filter((p) => {
    const matchStatus = filter === 'all' || p.status === filter;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.clientName.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors.bgDark }]}>
        <Text style={styles.headerTitle}>Projects</Text>
        <Text style={styles.headerSub}>{projects.length} total</Text>
      </View>

      {/* Search */}
      <View style={[styles.searchBox, { backgroundColor: C.card, borderColor: C.border }]}>
        <MaterialCommunityIcons name="magnify" size={20} color={C.textSecondary} />
        <RNTextInput
          style={[styles.searchInput, { color: C.text }]}
          placeholder="Search projects..."
          placeholderTextColor={C.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <MaterialCommunityIcons name="close-circle" size={18} color={C.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Status Filter */}
      <View style={styles.filterRow}>
        {STATUS_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterChip, filter === f.value && styles.filterChipActive]}
            onPress={() => setFilter(f.value)}
          >
            <Text style={[styles.filterChipText, filter === f.value && styles.filterChipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <ProjectCard project={item} C={C} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="office-building-outline" size={56} color={C.textSecondary} />
            <Text style={[styles.emptyTitle, { color: C.text }]}>No Projects Found</Text>
            <Text style={[styles.emptyText, { color: C.textSecondary }]}>
              {canAdd ? 'Tap + to create your first project' : 'No projects assigned yet'}
            </Text>
          </View>
        }
      />

      {canAdd && (
        <FAB
          icon="plus"
          style={styles.fab}
          color="#fff"
          onPress={() => router.push('/project/add')}
        />
      )}
    </View>
  );
}

function ProjectCard({ project, C }: { project: Project; C: any }) {
  const statusColor = STATUS_COLORS[project.status];
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: C.card }]}
      onPress={() => router.push(`/project/${project.id}`)}
    >
      <View style={styles.cardTop}>
        <View style={[styles.typeIcon, { backgroundColor: Colors.primary + '18' }]}>
          <MaterialCommunityIcons name={TYPE_ICONS[project.type] as any} size={22} color={Colors.primary} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.projectName, { color: C.text }]} numberOfLines={1}>{project.name}</Text>
          <Text style={[styles.clientName, { color: C.textSecondary }]} numberOfLines={1}>
            {project.clientName}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '18' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {project.status === 'on-hold' ? 'On Hold' : project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: C.border }]} />

      <View style={styles.cardBottom}>
        <InfoChip icon="map-marker-outline" label={project.location} C={C} />
        <InfoChip icon="calendar-outline" label={formatDate(project.startDate)} C={C} />
        <InfoChip icon="currency-inr" label={formatCurrency(project.contractAmount)} C={C} />
      </View>
    </TouchableOpacity>
  );
}

function InfoChip({ icon, label, C }: any) {
  return (
    <View style={styles.infoChip}>
      <MaterialCommunityIcons name={icon} size={13} color={C.textSecondary} />
      <Text style={[styles.infoChipText, { color: C.textSecondary }]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 52, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md,
  },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: '700', color: '#fff' },
  headerSub: { fontSize: FontSize.sm, color: Colors.textMuted },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    margin: Spacing.md, marginBottom: 8, paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: Radius.md, borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: FontSize.md },
  filterRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.md,
    gap: 8, marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.full,
    backgroundColor: Colors.bgCardLight, borderWidth: 1, borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  filterChipTextActive: { color: '#fff' },
  list: { padding: Spacing.md, gap: 12, paddingBottom: 80 },
  card: {
    borderRadius: Radius.md, padding: Spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  typeIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1 },
  projectName: { fontSize: FontSize.md, fontWeight: '700' },
  clientName: { fontSize: FontSize.sm, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  statusText: { fontSize: 11, fontWeight: '700' },
  divider: { height: 1, marginVertical: 10 },
  cardBottom: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  infoChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoChipText: { fontSize: 11 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: '700' },
  emptyText: { fontSize: FontSize.md, textAlign: 'center' },
  fab: {
    position: 'absolute', right: Spacing.md, bottom: 80,
    backgroundColor: Colors.primary,
  },
});
