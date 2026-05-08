import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import { updateUserProfile } from '../services/authService';
import { uploadFile, pickImage, takePhoto } from '../services/storageService';
import { Colors, Spacing, FontSize, Radius } from '../constants/Colors';

export default function ProfileScreen() {
  const { user, setUser } = useAuthStore();
  const { isDarkMode } = useAppStore();
  const C = isDarkMode ? Colors.dark : Colors.light;
  const [name, setName] = useState(user?.name ?? '');
  const [mobile, setMobile] = useState(user?.mobile ?? '');
  const [loading, setLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const ROLE_COLORS: Record<string, string> = { admin: Colors.primary, partner: Colors.info, staff: Colors.warning };

  const handlePhotoChange = () => {
    Alert.alert('Change Photo', 'Choose an option', [
      { text: 'Camera', onPress: async () => {
        setPhotoLoading(true);
        const r = await takePhoto();
        if (r && user) {
          const url = await uploadFile(r.uri, 'profiles', r.name);
          await updateUserProfile(user.uid, { photoURL: url });
          setUser({ ...user, photoURL: url });
        }
        setPhotoLoading(false);
      }},
      { text: 'Gallery', onPress: async () => {
        setPhotoLoading(true);
        const r = await pickImage();
        if (r && user) {
          const url = await uploadFile(r.uri, 'profiles', r.name);
          await updateUserProfile(user.uid, { photoURL: url });
          setUser({ ...user, photoURL: url });
        }
        setPhotoLoading(false);
      }},
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Error', 'Name cannot be empty.'); return; }
    setLoading(true);
    try {
      await updateUserProfile(user!.uid, { name: name.trim(), mobile: mobile.trim() });
      setUser({ ...user!, name: name.trim(), mobile: mobile.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { Alert.alert('Error', 'Failed to update profile.'); }
    finally { setLoading(false); }
  };

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      <View style={[styles.header, { backgroundColor: Colors.bgDark }]}>
        <TouchableOpacity onPress={() => router.back()}><MaterialCommunityIcons name="arrow-left" size={24} color="#fff" /></TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Photo */}
        <View style={styles.photoSection}>
          <TouchableOpacity onPress={handlePhotoChange} style={styles.photoWrapper}>
            {photoLoading ? (
              <View style={styles.photoPlaceholder}><ActivityIndicator color="#fff" /></View>
            ) : user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoInitial}>{user?.name?.charAt(0).toUpperCase() ?? '?'}</Text>
              </View>
            )}
            <View style={styles.editBadge}>
              <MaterialCommunityIcons name="camera" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
          <View style={[styles.roleBadge, { backgroundColor: ROLE_COLORS[user?.role ?? 'staff'] + '20' }]}>
            <Text style={[styles.roleText, { color: ROLE_COLORS[user?.role ?? 'staff'] }]}>
              {(user?.role ?? 'staff').toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Form */}
        <View style={[styles.card, { backgroundColor: C.card }]}>
          <Text style={[styles.label, { color: C.text }]}>Full Name</Text>
          <TextInput mode="outlined" value={name} onChangeText={setName}
            left={<TextInput.Icon icon="account-outline" />}
            style={styles.input} outlineColor={Colors.border} activeOutlineColor={Colors.primary} />

          <Text style={[styles.label, { color: C.text }]}>Email Address</Text>
          <TextInput mode="outlined" value={user?.email ?? ''} editable={false}
            left={<TextInput.Icon icon="email-outline" />}
            style={[styles.input, { opacity: 0.6 }]} outlineColor={Colors.border} activeOutlineColor={Colors.primary} />

          <Text style={[styles.label, { color: C.text }]}>Mobile Number</Text>
          <TextInput mode="outlined" value={mobile} onChangeText={setMobile} keyboardType="phone-pad"
            left={<TextInput.Icon icon="phone-outline" />}
            style={styles.input} outlineColor={Colors.border} activeOutlineColor={Colors.primary} />

          {saved && (
            <View style={styles.successBox}>
              <MaterialCommunityIcons name="check-circle" size={18} color={Colors.income} />
              <Text style={styles.successText}>Profile updated successfully!</Text>
            </View>
          )}

          <Button mode="contained" onPress={handleSave} loading={loading} disabled={loading}
            style={styles.saveBtn} contentStyle={{ paddingVertical: 6 }} buttonColor={Colors.primary}
            labelStyle={{ fontSize: FontSize.lg, fontWeight: '700' }}>
            Save Changes
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '700', color: '#fff' },
  scroll: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 40 },
  photoSection: { alignItems: 'center', gap: 12, paddingVertical: Spacing.md },
  photoWrapper: { position: 'relative' },
  photo: { width: 90, height: 90, borderRadius: 45 },
  photoPlaceholder: { width: 90, height: 90, borderRadius: 45, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  photoInitial: { color: '#fff', fontSize: 36, fontWeight: '700' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.bgDark, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.full },
  roleText: { fontSize: FontSize.sm, fontWeight: '700' },
  card: { borderRadius: Radius.lg, padding: Spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3 },
  label: { fontSize: FontSize.md, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: { marginBottom: 4, backgroundColor: 'transparent' },
  successBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.incomeLight, padding: 10, borderRadius: Radius.sm, marginTop: 8 },
  successText: { color: Colors.income, fontSize: FontSize.sm, fontWeight: '600' },
  saveBtn: { borderRadius: Radius.md, marginTop: Spacing.md },
});
