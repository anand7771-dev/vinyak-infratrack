import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { Project, ProjectStatus } from '../constants/types';
import { toDate } from '../utils/formatters';

const COL = 'projects';

// ─── Firestore converter ──────────────────────────────────────────────────────
const toProject = (id: string, data: any): Project => ({
  id,
  name: data.name,
  clientName: data.clientName,
  location: data.location,
  type: data.type,
  startDate: toDate(data.startDate),
  endDate: data.endDate ? toDate(data.endDate) : undefined,
  status: data.status,
  contractAmount: data.contractAmount,
  notes: data.notes ?? '',
  createdBy: data.createdBy,
  createdByName: data.createdByName,
  createdAt: toDate(data.createdAt),
  updatedAt: toDate(data.updatedAt),
});

// ─── Add project ──────────────────────────────────────────────────────────────
export const addProject = async (
  projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const ref = await addDoc(collection(db, COL), {
    ...projectData,
    startDate: projectData.startDate,
    endDate: projectData.endDate ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

// ─── Update project ───────────────────────────────────────────────────────────
export const updateProject = async (
  id: string,
  updates: Partial<Omit<Project, 'id' | 'createdAt' | 'createdBy'>>
): Promise<void> => {
  await updateDoc(doc(db, COL, id), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

// ─── Delete project ───────────────────────────────────────────────────────────
export const deleteProject = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COL, id));
};

// ─── Get single project ───────────────────────────────────────────────────────
export const getProject = async (id: string): Promise<Project | null> => {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return toProject(snap.id, snap.data());
};

// ─── Real-time listener: all projects ─────────────────────────────────────────
export const subscribeToProjects = (
  callback: (projects: Project[]) => void
): Unsubscribe => {
  const q = query(collection(db, COL), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const projects = snap.docs.map((d) => toProject(d.id, d.data()));
    callback(projects);
  });
};

// ─── Real-time listener: projects by user (for staff) ─────────────────────────
export const subscribeToUserProjects = (
  projectIds: string[],
  callback: (projects: Project[]) => void
): Unsubscribe => {
  if (projectIds.length === 0) {
    callback([]);
    return () => {};
  }
  const q = query(collection(db, COL), where('__name__', 'in', projectIds));
  return onSnapshot(q, (snap) => {
    const projects = snap.docs.map((d) => toProject(d.id, d.data()));
    callback(projects);
  });
};
