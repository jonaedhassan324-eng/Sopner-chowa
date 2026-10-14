export type UserRole = 'super_admin' | 'entry_operator' | 'member';

export type AccountStatus = 'active' | 'inactive' | 'suspended';

export type PaymentMethod = 'cash' | 'bkash' | 'nagad' | 'bank_transfer' | 'other';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  memberId: string;
  phone: string;
  permanentAddress: string;
  currentCountry: string;
  dateOfBirth?: string;
  photoUrl?: string;
  signatureUrl?: string;
  nomineeName?: string;
  nomineePhone?: string;
  nomineeRelation?: string;
  membershipStartDate: string;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  transactionId: string;
  memberUid: string;
  memberId: string;
  memberName: string;
  quarter: string; // e.g. "2026-Q1"
  fiscalYear: string; // e.g. "2026"
  amount: number;
  depositDate: string; // ISO date string (YYYY-MM-DD)
  entryTimestamp: string;
  operatorUid: string;
  operatorName: string;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  note?: string;
  status: 'confirmed' | 'reversed';
  isReversal?: boolean;
  reversedTransactionId?: string;
  reversalReason?: string;
  createdAt: string;
}

export interface SocietyConfig {
  societyNameBn: string;
  societyNameEn: string;
  registrationNo?: string;
  quarterlyDueAmount: number;
  currency: string;
  currencySymbol: string;
  currentFiscalYear: string;
  activeQuarter: string;
  contactNumber: string;
  email: string;
  address: string;
  updatedAt: string;
  updatedBy: string;
}

export interface AuditLog {
  id: string;
  action:
    | 'MEMBER_CREATED'
    | 'MEMBER_UPDATED'
    | 'ROLE_CHANGED'
    | 'DEPOSIT_RECORDED'
    | 'TRANSACTION_REVERSED'
    | 'CONFIG_UPDATED'
    | 'LOGIN';
  performedByUid: string;
  performedByName: string;
  performedByRole: string;
  targetId: string;
  targetType: 'member' | 'transaction' | 'user' | 'config' | 'auth';
  details: string;
  timestamp: string;
}

export interface QuarterPaymentStatus {
  quarter: string;
  quarterLabelEn: string;
  quarterLabelBn: string;
  dueAmount: number;
  paidAmount: number;
  status: 'paid' | 'partial' | 'unpaid' | 'overdue';
  dueDate: string;
  transactions: Transaction[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'normal' | 'urgent';
  authorUid: string;
  authorName: string;
  createdAt: string;
}
