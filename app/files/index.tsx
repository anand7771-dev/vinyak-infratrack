import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, ActivityIndicator, Linking, TextInput as RNTextInput,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { Colors, Spacing, FontSize, Radius } from '../../constants/Colors';
import {
  CompanyDocument, DocCategory,
  DOC_CATEGORY_LABELS, DOC_CATEGORY_ICONS, ALL_CATEGORIES,
  subscribeToCompanyDocuments, uploadCompanyDocument,
  saveCompanyDocument, deleteCompanyDocument,
} from '../../services/documentService';

const CATEGORY_COLORS: Record<DocCategory, string> = {
  audit_report: '#7C3AED',
  balance_sheet: '#059669',
  tax_document: '#D97706',
  license: '#2563EB',
  contract: '#DC2626',
  invoice: '#0891B2',
  bank_statement: '#65A30D',
  insurance: '#9333EA',
  other: '#6B7280',
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function FilesScreen() {
  const { user, firebaseUser } = useAuthStore();
  const { isDarkMode } = useAppStore();
  const C = isDarkMode ? Colors.dark : Colors.light;

  const [documents, setDocuments] = useState<CompanyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<DocCategory | 'all'>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload form state
  const [pickedFile, setPickedFile] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<DocCategory>('other');
  const [docNotes, setDocNotes] = useState('');

  useEffect(() => {
    const unsub = subscribeToCompanyDocuments((docs) => {
      setDocuments(docs);
      setLoading(false);
    });
    return unsub;
  }, []);

  const filtered = documents.filter((d) => {
    const matchCat = activeCategory === 'all' || d.category === activeCategory;
    const matchSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      DOC_CATEGORY_LABELS[d.category].toLowerCase().includes(search.toLowerCase()) ||
      (d.notes ?? '').toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets[0]) {
        setPickedFile(result.assets[0]);
        setShowUploadModal(true);
      }
    } catch (e) {
      Alert.alert('Error', 'Could not pick file.');
    }
  };

  const handleUpload = async () => {
    if (!pickedFile || !firebaseUser) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const { url, storagePath } = await uploadCompanyDocument(
        pickedFile.uri,
        pickedFile.name,
        pickedFile.mimeType ?? 'application/octet-stream',
        setUploadProgress
      );
      await saveCompanyDocument({
        name: pickedFile.name,
        category: selectedCategory,
        fileURL: url,
        storagePath,
        fileType: pickedFile.mimeType ?? 'application/octet-stream',
        fileSize: pickedFile.size ?? 0,
        notes: docNotes.trim(),
        uploadedBy: firebaseUser.uid,
        uploadedByName: user?.name ?? 'Unknown',
      });
      setShowUploadModal(false);
      setPickedFile(null);
      setDocNotes('');
      setSelectedCategory('other');
      Alert.alert('✅ Uploaded', `"${pickedFile.name}" has been saved.`);
    } catch (e: any) {
      Alert.alert('Upload Failed', e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleOpen = (doc: CompanyDocument) => {
    Linking.openURL(doc.fileURL).catch(() =>
      Alert.alert('Error', 'Could not open file. Try again.')
    );
  };

  const handleDelete = (doc: CompanyDocument) => {
    const canDel = user?.role === 'admin' || doc.uploadedBy === firebaseUser?.uid;
    if (!canDel) {
      Alert.alert('Permission Denied', 'Only the uploader or admin can delete this file.');
      return;
    }
    Alert.alert(
      'Delete File',
      `Delete "${doc.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            try {
              await deleteCompanyDocument(doc.id, doc.storagePath);
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ]
    );
  };

  const getFileIcon = (mimeType: string): string => {
    if (mimeType.includes('pdf')) return 'file-pdf-box';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'file-word-box';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'file-excel-box';
    if (mimeType.includes('image')) return 'file-image-box';
    if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'zip-box';
    return 'file-document-box';
  };

  const getFileIconColor = (mimeType: string): string => {
    if (mimeType.includes('pdf')) return '#E53935';
    if (mimeType.includes('word') || mimeType.includes('document')) return '#1E88E5';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return '#43A047';
    if (mimeType.includes('image')) return '#FB8C00';
    return Colors.primary;
  };

  // ─── Upload Modal ───────────────────────────────────────────────────────────
  if (showUploadModal) {
    return (
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: C.bg }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: Colors.bgDark }]}>
          <TouchableOpacity onPress={() => { setShowUploadModal(false); setPickedFile(null); }}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Upload Document</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.uploadScrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.uploadModalContent, { backgroundColor: C.card }]}>
            {/* File Preview */}
            <View style={[styles.filePreviewBox, { backgroundColor: C.bg }]}>
              <MaterialCommunityIcons
                name={getFileIcon(pickedFile?.mimeType ?? '') as any}
                size={52}
                color={getFileIconColor(pickedFile?.mimeType ?? '')}
              />
              <Text style={[styles.filePreviewName, { color: C.text }]} numberOfLines={2}>
                {pickedFile?.name}
              </Text>
              <Text style={[styles.filePreviewSize, { color: C.textSecondary }]}>
                {formatBytes(pickedFile?.size ?? 0)}
              </Text>
            </View>

            {/* Category */}
            <Text style={[styles.label, { color: C.text }]}>Document Category *</Text>
            <View style={styles.categoryGrid}>
              {ALL_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.catChip,
                    { borderColor: CATEGORY_COLORS[cat] + '60' },
                    selectedCategory === cat && { backgroundColor: CATEGORY_COLORS[cat], borderColor: CATEGORY_COLORS[cat] },
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <MaterialCommunityIcons
                    name={DOC_CATEGORY_ICONS[cat] as any}
                    size={14}
                    color={selectedCategory === cat ? '#fff' : CATEGORY_COLORS[cat]}
                  />
                  <Text style={[
                    styles.catChipText,
                    { color: selectedCategory === cat ? '#fff' : CATEGORY_COLORS[cat] }
                  ]}>
                    {DOC_CATEGORY_LABELS[cat]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Notes */}
            <Text style={[styles.label, { color: C.text }]}>Notes (Optional)</Text>
            <RNTextInput
              style={[styles.notesInput, { color: C.text, borderColor: C.border, backgroundColor: C.bg }]}
              placeholder="e.g. FY 2024-25 audit report..."
              placeholderTextColor={C.textSecondary}
              value={docNotes}
              onChangeText={setDocNotes}
              multiline
              numberOfLines={3}
            />

            {/* Progress Bar */}
            {uploading && (
              <View style={styles.progressBox}>
                <ActivityIndicator color={Colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.progressText, { color: C.text }]}>
                    Uploading... {Math.round(uploadProgress)}%
                  </Text>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${uploadProgress}%` as any }]} />
                  </View>
                </View>
              </View>
            )}

            {/* Upload Button */}
            <TouchableOpacity
              style={[styles.uploadBtn, uploading && { opacity: 0.6 }]}
              onPress={handleUpload}
              disabled={uploading}
            >
              <MaterialCommunityIcons name="cloud-upload" size={22} color="#fff" />
              <Text style={styles.uploadBtnText}>
                {uploading ? 'Uploading...' : 'Upload Document'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ─── Main Files Screen ──────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors.bgDark }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Company Files</Text>
          <Text style={styles.headerSub}>{documents.length} document{documents.length !== 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity
          style={styles.uploadIconBtn}
          onPress={handlePickFile}
        >
          <MaterialCommunityIcons name="plus" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={[styles.searchBox, { backgroundColor: C.card, borderColor: C.border }]}>
        <MaterialCommunityIcons name="magnify" size={20} color={C.textSecondary} />
        <RNTextInput
          style={[styles.searchInput, { color: C.text }]}
          placeholder="Search documents..."
          placeholderTextColor={C.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <MaterialCommunityIcons name="close-circle" size={18} color={C.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter */}
      <FlatList
        horizontal
        data={[{ id: 'all', label: 'All Files' }, ...ALL_CATEGORIES.map(c => ({ id: c, label: DOC_CATEGORY_LABELS[c] }))]}
        keyExtractor={(i) => i.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catFilterRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.catFilter,
              activeCategory === item.id && { backgroundColor: Colors.primary, borderColor: Colors.primary },
              activeCategory !== item.id && { borderColor: C.border, backgroundColor: C.card },
            ]}
            onPress={() => setActiveCategory(item.id as any)}
          >
            {item.id !== 'all' && (
              <MaterialCommunityIcons
                name={DOC_CATEGORY_ICONS[item.id as DocCategory] as any}
                size={13}
                color={activeCategory === item.id ? '#fff' : CATEGORY_COLORS[item.id as DocCategory]}
              />
            )}
            <Text style={[
              styles.catFilterText,
              { color: activeCategory === item.id ? '#fff' : C.text }
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Document List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[styles.docCard, { backgroundColor: C.card }]}>
              {/* Category badge */}
              <View style={[styles.catBadge, { backgroundColor: CATEGORY_COLORS[item.category] + '15' }]}>
                <MaterialCommunityIcons
                  name={DOC_CATEGORY_ICONS[item.category] as any}
                  size={14}
                  color={CATEGORY_COLORS[item.category]}
                />
                <Text style={[styles.catBadgeText, { color: CATEGORY_COLORS[item.category] }]}>
                  {DOC_CATEGORY_LABELS[item.category]}
                </Text>
              </View>

              <View style={styles.docRow}>
                {/* File Icon */}
                <View style={[styles.fileIconBox, { backgroundColor: getFileIconColor(item.fileType) + '15' }]}>
                  <MaterialCommunityIcons
                    name={getFileIcon(item.fileType) as any}
                    size={32}
                    color={getFileIconColor(item.fileType)}
                  />
                </View>

                {/* Info */}
                <View style={styles.docInfo}>
                  <Text style={[styles.docName, { color: C.text }]} numberOfLines={2}>
                    {item.name}
                  </Text>
                  {item.notes ? (
                    <Text style={[styles.docNotes, { color: C.textSecondary }]} numberOfLines={1}>
                      {item.notes}
                    </Text>
                  ) : null}
                  <View style={styles.docMeta}>
                    <Text style={[styles.docMetaText, { color: C.textSecondary }]}>
                      {formatBytes(item.fileSize)}
                    </Text>
                    <Text style={[styles.docMetaDot, { color: C.textSecondary }]}>•</Text>
                    <Text style={[styles.docMetaText, { color: C.textSecondary }]}>
                      {formatDate(item.createdAt)}
                    </Text>
                    <Text style={[styles.docMetaDot, { color: C.textSecondary }]}>•</Text>
                    <Text style={[styles.docMetaText, { color: C.textSecondary }]}>
                      {item.uploadedByName}
                    </Text>
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.docActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: Colors.primary + '15' }]}
                    onPress={() => handleOpen(item)}
                  >
                    <MaterialCommunityIcons name="open-in-new" size={18} color={Colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: Colors.expense + '15', marginTop: 6 }]}
                    onPress={() => handleDelete(item)}
                  >
                    <MaterialCommunityIcons name="trash-can-outline" size={18} color={Colors.expense} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons name="folder-open-outline" size={64} color={C.textSecondary} />
              <Text style={[styles.emptyTitle, { color: C.text }]}>No Documents Yet</Text>
              <Text style={[styles.emptyText, { color: C.textSecondary }]}>
                Tap the + button to upload audit reports, balance sheets, and other company documents.
              </Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={handlePickFile}>
                <MaterialCommunityIcons name="upload" size={18} color="#fff" />
                <Text style={styles.emptyBtnText}>Upload First Document</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 52, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md,
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '700', color: '#fff' },
  headerSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  uploadIconBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: Spacing.md, marginVertical: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: Radius.md, borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: FontSize.md },
  catFilterRow: { paddingHorizontal: Spacing.md, gap: 8, paddingBottom: 8 },
  catFilter: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: Radius.full, borderWidth: 1,
  },
  catFilterText: { fontSize: FontSize.sm, fontWeight: '600' },
  list: { padding: Spacing.md, gap: 12, paddingBottom: 100 },
  docCard: {
    borderRadius: Radius.md, padding: Spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
    gap: 10,
  },
  catBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: Radius.full,
  },
  catBadgeText: { fontSize: 11, fontWeight: '700' },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  fileIconBox: {
    width: 56, height: 56, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  docInfo: { flex: 1 },
  docName: { fontSize: FontSize.md, fontWeight: '700', lineHeight: 20 },
  docNotes: { fontSize: FontSize.sm, marginTop: 3, fontStyle: 'italic' },
  docMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, flexWrap: 'wrap' },
  docMetaText: { fontSize: 11, fontWeight: '500' },
  docMetaDot: { fontSize: 11 },
  docActions: { alignItems: 'center' },
  actionBtn: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: Spacing.xl, gap: 10 },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: '700' },
  emptyText: { fontSize: FontSize.md, textAlign: 'center', lineHeight: 22 },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: Radius.full, marginTop: 8,
  },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.md },
  // Upload modal
  uploadScrollContent: {
    padding: Spacing.md, paddingBottom: 40,
  },
  uploadModalContent: {
    borderRadius: Radius.lg, padding: Spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 3, gap: 4,
  },
  filePreviewBox: {
    alignItems: 'center', padding: Spacing.lg,
    borderRadius: Radius.md, gap: 8, marginBottom: 8,
  },
  filePreviewName: { fontSize: FontSize.md, fontWeight: '700', textAlign: 'center' },
  filePreviewSize: { fontSize: FontSize.sm },
  label: { fontSize: FontSize.md, fontWeight: '600', marginTop: 12, marginBottom: 8 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 7,
    borderRadius: Radius.full, borderWidth: 1.5,
  },
  catChipText: { fontSize: FontSize.sm, fontWeight: '600' },
  notesInput: {
    borderWidth: 1, borderRadius: Radius.sm, padding: 12,
    fontSize: FontSize.md, minHeight: 70, textAlignVertical: 'top',
    marginBottom: 8,
  },
  progressBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.primary + '15', padding: 12, borderRadius: Radius.sm,
  },
  progressTrack: {
    height: 4, backgroundColor: Colors.border,
    borderRadius: 2, marginTop: 6, overflow: 'hidden',
  },
  progressFill: {
    height: 4, backgroundColor: Colors.primary, borderRadius: 2,
  },
  progressText: { fontSize: FontSize.md, fontWeight: '600' },
  uploadBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: Colors.primary, padding: 16,
    borderRadius: Radius.md, marginTop: 8,
  },
  uploadBtnText: { color: '#fff', fontSize: FontSize.lg, fontWeight: '700' },
});
