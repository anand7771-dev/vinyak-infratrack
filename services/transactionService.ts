import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Transaction } from '../constants/types';
import { toDate } from '../utils/formatters';

const COL = 'transactions';

// ─── Converter ────────────────────────────────────────────────────────────────
const toTransaction = (id: string, data: any): Transaction => ({
  id,
  type: data.type,
  amount: data.amount,
  date: toDate(data.date),
  projectId: data.projectId,
  projectName: data.projectName,
  category: data.category,
  paymentMode: data.paymentMode,
  clientOrVendor: data.clientOrVendor,
  notes: data.notes ?? '',
  attachmentURL: data.attachmentURL ?? undefined,
  addedBy: data.addedBy,
  addedByName: data.addedByName,
  createdAt: toDate(data.createdAt),
  synced: true,
});

// ─── Add transaction ──────────────────────────────────────────────────────────
export const addTransaction = async (
  tx: Omit<Transaction, 'id' | 'createdAt' | 'synced'>
): Promise<string> => {
  const ref = await addDoc(collection(db, COL), {
    ...tx,
    date: Timestamp.fromDate(tx.date),
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

// ─── Update transaction ───────────────────────────────────────────────────────
export const updateTransaction = async (
  id: string,
  updates: Partial<Omit<Transaction, 'id' | 'createdAt' | 'addedBy'>>
): Promise<void> => {
  await updateDoc(doc(db, COL, id), updates);
};

// ─── Delete transaction ───────────────────────────────────────────────────────
export const deleteTransaction = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COL, id));
};

// ─── Real-time: all transactions ──────────────────────────────────────────────
export const subscribeToTransactions = (
  callback: (txs: Transaction[]) => void,
  limitCount = 100
): Unsubscribe => {
  const q = query(
    collection(db, COL),
    orderBy('date', 'desc'),
    limit(limitCount)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => toTransaction(d.id, d.data())));
  });
};

// ─── Real-time: transactions by project ───────────────────────────────────────
export const subscribeToProjectTransactions = (
  projectId: string,
  callback: (txs: Transaction[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, COL),
    where('projectId', '==', projectId),
    orderBy('date', 'desc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => toTransaction(d.id, d.data())));
  });
};

// ─── Real-time: recent transactions ───────────────────────────────────────────
export const subscribeToRecentTransactions = (
  callback: (txs: Transaction[]) => void,
  count = 10
): Unsubscribe => {
  const q = query(
    collection(db, COL),
    orderBy('createdAt', 'desc'),
    limit(count)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => toTransaction(d.id, d.data())));
  });
};

// ─── Compute summary from transactions ────────────────────────────────────────
export const computeSummary = (
  txs: Transaction[]
): { totalIncome: number; totalExpense: number; balance: number } => {
  const totalIncome = txs
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = txs
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
};
