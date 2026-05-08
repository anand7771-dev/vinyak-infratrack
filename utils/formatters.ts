import { formatDistanceToNow, format } from 'date-fns';

// ─── Currency Formatter ───────────────────────────────────────────────────────
export const formatCurrency = (amount: number): string => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const formatCurrencyFull = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// ─── Date Formatters ─────────────────────────────────────────────────────────
export const formatDate = (date: Date | string | undefined): string => {
  if (!date) return '—';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '—';
  return format(d, 'dd MMM yyyy');
};

export const formatDateTime = (date: Date | string | undefined): string => {
  if (!date) return '—';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '—';
  return format(d, 'dd MMM yyyy, hh:mm a');
};

export const formatTimeAgo = (date: Date | string | undefined): string => {
  if (!date) return '—';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '—';
  return formatDistanceToNow(d, { addSuffix: true });
};

export const formatMonth = (date: Date): string => {
  return format(date, 'MMM yyyy');
};

// ─── Firestore Date Converter ─────────────────────────────────────────────────
export const toDate = (val: any): Date => {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (typeof val.toDate === 'function') return val.toDate();
  return new Date(val);
};

// ─── String Helpers ───────────────────────────────────────────────────────────
export const capitalize = (s: string): string =>
  s.charAt(0).toUpperCase() + s.slice(1);

export const truncate = (s: string, n: number): string =>
  s.length > n ? s.slice(0, n) + '...' : s;
