import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

// ─── Upload receipt/bill from URI ─────────────────────────────────────────────
// NOTE: Storage requires Firebase Blaze plan. If not enabled, uploads are skipped.
export const uploadFile = async (
  uri: string,
  folder: 'receipts' | 'bills' | 'profiles',
  fileName: string
): Promise<string> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `${folder}/${Date.now()}_${fileName}`);
    await uploadBytes(storageRef, blob);
    return getDownloadURL(storageRef);
  } catch (e: any) {
    console.warn('Storage upload skipped (Storage may not be enabled):', e.message);
    return ''; // Return empty string so app continues without attachment
  }
};

// ─── Delete file from Storage ─────────────────────────────────────────────────
export const deleteFile = async (url: string): Promise<void> => {
  const fileRef = ref(storage, url);
  await deleteObject(fileRef);
};

// ─── Pick image from gallery ──────────────────────────────────────────────────
export const pickImage = async (): Promise<{
  uri: string;
  name: string;
} | null> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permission denied to access media library.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) return null;

  const asset = result.assets[0];
  const name = asset.fileName ?? `image_${Date.now()}.jpg`;
  return { uri: asset.uri, name };
};

// ─── Take photo with camera ───────────────────────────────────────────────────
export const takePhoto = async (): Promise<{
  uri: string;
  name: string;
} | null> => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permission denied to use camera.');
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) return null;

  const asset = result.assets[0];
  const name = `photo_${Date.now()}.jpg`;
  return { uri: asset.uri, name };
};

// ─── Pick PDF document ────────────────────────────────────────────────────────
export const pickDocument = async (): Promise<{
  uri: string;
  name: string;
} | null> => {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/pdf', 'image/*'],
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets[0]) return null;

  const asset = result.assets[0];
  return { uri: asset.uri, name: asset.name };
};
