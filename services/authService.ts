import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { AppUser, UserRole } from '../constants/types';

// ─── Register new user ────────────────────────────────────────────────────────
export const registerUser = async (
  email: string,
  password: string,
  name: string,
  mobile: string,
  role: UserRole = 'staff'
): Promise<AppUser> => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });

  const userData: AppUser = {
    uid: cred.user.uid,
    name,
    email,
    mobile,
    role,
    createdAt: new Date(),
    active: true,
  };

  await setDoc(doc(db, 'users', cred.user.uid), {
    ...userData,
    createdAt: serverTimestamp(),
  });

  return userData;
};

// ─── Login ────────────────────────────────────────────────────────────────────
export const loginUser = async (
  email: string,
  password: string
): Promise<User> => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
};

// ─── Logout ───────────────────────────────────────────────────────────────────
export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

// ─── Reset Password ───────────────────────────────────────────────────────────
export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

// ─── Fetch user profile ───────────────────────────────────────────────────────
export const fetchUserProfile = async (uid: string): Promise<AppUser | null> => {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
  } as AppUser;
};

// ─── Update user profile ──────────────────────────────────────────────────────
export const updateUserProfile = async (
  uid: string,
  updates: Partial<Pick<AppUser, 'name' | 'mobile' | 'photoURL'>>
): Promise<void> => {
  await updateDoc(doc(db, 'users', uid), updates);
  if (updates.name && auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: updates.name });
  }
};
