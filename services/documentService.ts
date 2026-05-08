import {
  collection, doc, addDoc, deleteDoc,
  query, orderBy, onSnapshot, Unsubscribe, serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';

export type DocCategory =
  | 'audit_report'
  | 'balance_sheet'
  | 'tax_document'
  | 'license'
  | 'contract'
  | 'invoice'
  | 'bank_statement'
  | 'insurance'
  | 'other';

export interface CompanyDocument {
  id: string;
  name: string;
  category: DocCategory;
  fileURL: string;
  storagePath: string;
  fileType: string; // mime type
  fileSize: number; // bytes
  notes?: string;
  uploadedBy: string;
  uploadedByName: string;
  createdAt: Date;
}

const COL = 'company_documents';

// ─── Upload file to Firebase Storage ─────────────────────────────────────────
export const uploadCompanyDocument = async (
  uri: string,
  fileName: string,
  mimeType: string,
  onProgress?: (pct: number) => void
): Promise<{ url: string; storagePath: string }> => {
  const response = await fetch(uri);
  const blob = await response.blob();
  const storagePath = `company_docs/${Date.now()}_${fileName}`;
  const storageRef = ref(storage, storagePath);

  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, blob, { contentType: mimeType });
    task.on(
      'state_changed',
      (snap) => onProgress && onProgress((snap.bytesTransferred / snap.totalBytes) * 100),
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve({ url, storagePath });
      }
    );
  });
};

// ─── Save document record to Firestore ───────────────────────────────────────
export const saveCompanyDocument = async (
  doc_: Omit<CompanyDocument, 'id' | 'createdAt'>
): Promise<string> => {
  const ref_ = await addDoc(collection(db, COL), {
    ...doc_,
    createdAt: serverTimestamp(),
  });
  return ref_.id;
};

// ─── Delete document (Firestore + Storage) ────────────────────────────────────
export const deleteCompanyDocument = async (
  id: string,
  storagePath: string
): Promise<void> => {
  await deleteDoc(doc(db, COL, id));
  try {
    await deleteObject(ref(storage, storagePath));
  } catch (_) {
    // Storage file may already be gone — ignore
  }
};

// ─── Real-time listener ───────────────────────────────────────────────────────
export const subscribeToCompanyDocuments = (
  callback: (docs: CompanyDocument[]) => void
): Unsubscribe => {
  const q = query(collection(db, COL), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(
      snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
        createdAt: d.data().createdAt?.toDate() ?? new Date(),
      }))
    );
  });
};

// ─── Category labels ──────────────────────────────────────────────────────────
export const DOC_CATEGORY_LABELS: Record<DocCategory, string> = {
  audit_report: 'Audit Report',
  balance_sheet: 'Balance Sheet',
  tax_document: 'Tax Document',
  license: 'License / Permit',
  contract: 'Contract',
  invoice: 'Invoice',
  bank_statement: 'Bank Statement',
  insurance: 'Insurance',
  other: 'Other',
};

export const DOC_CATEGORY_ICONS: Record<DocCategory, string> = {
  audit_report: 'clipboard-check-outline',
  balance_sheet: 'scale-balance',
  tax_document: 'bank-outline',
  license: 'certificate-outline',
  contract: 'file-sign',
  invoice: 'receipt',
  bank_statement: 'credit-card-outline',
  insurance: 'shield-check-outline',
  other: 'file-outline',
};

export const ALL_CATEGORIES: DocCategory[] = [
  'audit_report', 'balance_sheet', 'tax_document', 'license',
  'contract', 'invoice', 'bank_statement', 'insurance', 'other',
];
