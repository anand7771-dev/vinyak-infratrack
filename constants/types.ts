// ─── Application-wide TypeScript Types ───────────────────────────────────────

export type UserRole = 'admin' | 'partner' | 'staff';

export type ProjectType = 'road' | 'bridge' | 'building';
export type ProjectStatus = 'active' | 'completed' | 'on-hold';

export type TransactionType = 'income' | 'expense';

export type PaymentMode = 'cash' | 'bank_transfer' | 'upi' | 'cheque';

export type ExpenseCategory =
  | 'material'
  | 'labor'
  | 'machinery'
  | 'fuel'
  | 'transport'
  | 'cement'
  | 'steel'
  | 'sand'
  | 'electrical'
  | 'miscellaneous';

// ─── User ────────────────────────────────────────────────────────────────────
export interface AppUser {
  uid: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  photoURL?: string;
  assignedProjects?: string[]; // for staff role
  createdAt: Date;
  active: boolean;
}

// ─── Project ─────────────────────────────────────────────────────────────────
export interface Project {
  id: string;
  name: string;
  clientName: string;
  location: string;
  type: ProjectType;
  startDate: Date;
  endDate?: Date;
  status: ProjectStatus;
  contractAmount: number;
  notes?: string;
  createdBy: string;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Transaction ─────────────────────────────────────────────────────────────
export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: Date;
  projectId: string;
  projectName: string;
  category?: ExpenseCategory;         // for expenses
  paymentMode: PaymentMode;
  clientOrVendor: string;             // client name (income) or vendor (expense)
  notes?: string;
  attachmentURL?: string;
  addedBy: string;
  addedByName: string;
  createdAt: Date;
  // offline support
  synced?: boolean;
}

// ─── Notification ────────────────────────────────────────────────────────────
export interface AppNotification {
  id: string;
  message: string;
  type: 'income' | 'expense' | 'project' | 'report' | 'general';
  read: boolean;
  userId?: string; // if targeted, else broadcast
  createdAt: Date;
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────────
export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  activeProjects: number;
}

// ─── Report Filters ──────────────────────────────────────────────────────────
export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  projectId?: string;
  category?: ExpenseCategory;
  type?: TransactionType;
}

// ─── Dropdown Option ─────────────────────────────────────────────────────────
export interface DropdownOption {
  label: string;
  value: string;
}

// ─── Label Maps ──────────────────────────────────────────────────────────────
export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  road: 'Road Construction',
  bridge: 'Bridge Construction',
  building: 'Building Construction',
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  active: 'Active',
  completed: 'Completed',
  'on-hold': 'On Hold',
};

export const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = {
  cash: 'Cash',
  bank_transfer: 'Bank Transfer',
  upi: 'UPI',
  cheque: 'Cheque',
};

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  material: 'Material',
  labor: 'Labor',
  machinery: 'Machinery',
  fuel: 'Fuel',
  transport: 'Transport',
  cement: 'Cement',
  steel: 'Steel',
  sand: 'Sand',
  electrical: 'Electrical',
  miscellaneous: 'Miscellaneous',
};
