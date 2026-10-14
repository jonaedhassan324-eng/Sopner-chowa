import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  UserProfile,
  Transaction,
  SocietyConfig,
  AuditLog,
  QuarterPaymentStatus,
  UserRole,
} from '../types';

export const DEFAULT_SOCIETY_CONFIG: SocietyConfig = {
  societyNameBn: 'স্বপ্নের চূড়া সঞ্চয় সমিতি',
  societyNameEn: 'Shopner Chura Savings Society',
  registrationNo: 'REG-DH-2024/914',
  quarterlyDueAmount: 3000,
  currency: 'BDT',
  currencySymbol: '৳',
  currentFiscalYear: '2026',
  activeQuarter: '2026-Q1',
  contactNumber: '+880 1712-345678',
  email: 'info@shopnerchura.org',
  address: 'Shopner Chura Bhaban, Road 12, Mirpur DOHS, Dhaka-1216, Bangladesh',
  updatedAt: new Date().toISOString(),
  updatedBy: 'system',
};

// 1. Get User Profile
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    return snap.data() as UserProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// 2. Create or Update User Profile
export async function saveUserProfile(profile: UserProfile, performedBy?: { uid: string; name: string; role: string }): Promise<void> {
  const path = `users/${profile.uid}`;
  try {
    await setDoc(doc(db, 'users', profile.uid), {
      ...profile,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    // If role is super_admin, sync with /admins collection
    if (profile.role === 'super_admin') {
      await setDoc(doc(db, 'admins', profile.uid), {
        uid: profile.uid,
        email: profile.email,
        assignedAt: new Date().toISOString(),
      }, { merge: true });
    } else if (profile.role === 'entry_operator') {
      await setDoc(doc(db, 'operators', profile.uid), {
        uid: profile.uid,
        email: profile.email,
        assignedAt: new Date().toISOString(),
      }, { merge: true });
    }

    if (performedBy) {
      await logAuditEvent({
        action: 'MEMBER_UPDATED',
        performedByUid: performedBy.uid,
        performedByName: performedBy.name,
        performedByRole: performedBy.role,
        targetId: profile.memberId || profile.uid,
        targetType: 'member',
        details: `Updated profile & role for ${profile.displayName} (${profile.memberId})`,
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 3. Get All Registered Members
export async function getAllMembers(): Promise<UserProfile[]> {
  const path = 'users';
  try {
    const snap = await getDocs(collection(db, 'users'));
    const members: UserProfile[] = [];
    snap.forEach((d) => {
      members.push(d.data() as UserProfile);
    });
    return members.sort((a, b) => (a.memberId || '').localeCompare(b.memberId || ''));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// 4. Get Society Configuration
export async function getSocietyConfig(): Promise<SocietyConfig> {
  const path = 'society_config/general';
  try {
    const snap = await getDoc(doc(db, 'society_config', 'general'));
    if (!snap.exists()) {
      return DEFAULT_SOCIETY_CONFIG;
    }
    return snap.data() as SocietyConfig;
  } catch (error) {
    console.warn('Could not read remote society_config, using default:', error);
    return DEFAULT_SOCIETY_CONFIG;
  }
}

// 5. Update Society Configuration
export async function updateSocietyConfig(
  config: Partial<SocietyConfig>,
  adminUid: string,
  adminName: string
): Promise<SocietyConfig> {
  const path = 'society_config/general';
  try {
    const current = await getSocietyConfig();
    const updated: SocietyConfig = {
      ...current,
      ...config,
      updatedAt: new Date().toISOString(),
      updatedBy: adminUid,
    };
    await setDoc(doc(db, 'society_config', 'general'), updated, { merge: true });

    await logAuditEvent({
      action: 'CONFIG_UPDATED',
      performedByUid: adminUid,
      performedByName: adminName,
      performedByRole: 'super_admin',
      targetId: 'society_config/general',
      targetType: 'config',
      details: `Updated quarterly due to ৳${updated.quarterlyDueAmount} and active quarter to ${updated.activeQuarter}`,
    });

    return updated;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Helper: Generate unique transaction ID
export function generateTransactionId(quarter: string): string {
  const cleanQ = quarter.replace('-', '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  const time = Date.now().toString().slice(-4);
  return `TXN-${cleanQ}-${rand}${time}`;
}

// 6. Record Quarterly Deposit
export async function recordQuarterlyDeposit(params: {
  memberUid: string;
  memberId: string;
  memberName: string;
  quarter: string;
  fiscalYear: string;
  amount: number;
  depositDate: string;
  operatorUid: string;
  operatorName: string;
  paymentMethod: Transaction['paymentMethod'];
  paymentReference?: string;
  note?: string;
}): Promise<Transaction> {
  const path = 'transactions';

  // 1. Duplicate submission check (prevent accidental double click within 10 seconds for same member and amount)
  try {
    const recentQuery = query(
      collection(db, 'transactions'),
      where('memberUid', '==', params.memberUid),
      where('quarter', '==', params.quarter),
      where('amount', '==', params.amount),
      limit(3)
    );
    const existingSnap = await getDocs(recentQuery);
    const tenSecondsAgo = Date.now() - 10000;
    for (const d of existingSnap.docs) {
      const data = d.data() as Transaction;
      if (data.status === 'confirmed') {
        const entryTime = new Date(data.entryTimestamp).getTime();
        if (entryTime > tenSecondsAgo) {
          throw new Error('Duplicate submission detected. A deposit with this exact amount and quarter was just recorded moments ago.');
        }
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('Duplicate submission')) {
      throw err;
    }
    // Ignore query indexing errors for duplicate check, proceed safely
  }

  const transactionId = generateTransactionId(params.quarter);
  const now = new Date().toISOString();

  const newTxn: Transaction = {
    id: transactionId,
    transactionId,
    memberUid: params.memberUid,
    memberId: params.memberId,
    memberName: params.memberName,
    quarter: params.quarter,
    fiscalYear: params.fiscalYear,
    amount: Number(params.amount),
    depositDate: params.depositDate,
    entryTimestamp: now,
    operatorUid: params.operatorUid,
    operatorName: params.operatorName,
    paymentMethod: params.paymentMethod,
    paymentReference: params.paymentReference?.trim() || '',
    note: params.note?.trim() || '',
    status: 'confirmed',
    createdAt: now,
  };

  try {
    await setDoc(doc(db, 'transactions', transactionId), newTxn);

    // Audit log
    await logAuditEvent({
      action: 'DEPOSIT_RECORDED',
      performedByUid: params.operatorUid,
      performedByName: params.operatorName,
      performedByRole: 'operator',
      targetId: transactionId,
      targetType: 'transaction',
      details: `Deposited ৳${params.amount.toLocaleString()} for member ${params.memberName} (${params.memberId}) for ${params.quarter} via ${params.paymentMethod.toUpperCase()}`,
    });

    return newTxn;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `transactions/${transactionId}`);
  }
}

// 7. Controlled Reversal / Correction
export async function reverseTransaction(params: {
  transactionId: string;
  reason: string;
  adminUid: string;
  adminName: string;
}): Promise<void> {
  const path = `transactions/${params.transactionId}`;
  try {
    const txnRef = doc(db, 'transactions', params.transactionId);
    const snap = await getDoc(txnRef);
    if (!snap.exists()) {
      throw new Error(`Transaction ${params.transactionId} not found.`);
    }

    const originalTxn = snap.data() as Transaction;
    if (originalTxn.status === 'reversed') {
      throw new Error(`Transaction ${params.transactionId} has already been reversed.`);
    }

    // Never silently overwrite or delete! Mark original as reversed with audited explanation
    await updateDoc(txnRef, {
      status: 'reversed',
      reversalReason: params.reason,
      reversedByUid: params.adminUid,
      reversedByName: params.adminName,
      reversedAt: new Date().toISOString(),
    });

    // Create auditable offsetting reversal entry for balance calculations and transparency
    const reversalTxnId = `REV-${params.transactionId}`;
    const reversalRecord: Transaction = {
      id: reversalTxnId,
      transactionId: reversalTxnId,
      memberUid: originalTxn.memberUid,
      memberId: originalTxn.memberId,
      memberName: originalTxn.memberName,
      quarter: originalTxn.quarter,
      fiscalYear: originalTxn.fiscalYear,
      amount: -Math.abs(originalTxn.amount),
      depositDate: new Date().toISOString().split('T')[0],
      entryTimestamp: new Date().toISOString(),
      operatorUid: params.adminUid,
      operatorName: params.adminName,
      paymentMethod: originalTxn.paymentMethod,
      note: `Correction Reversal for ${originalTxn.transactionId}: ${params.reason}`,
      status: 'reversed',
      isReversal: true,
      reversedTransactionId: originalTxn.transactionId,
      reversalReason: params.reason,
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'transactions', reversalTxnId), reversalRecord);

    await logAuditEvent({
      action: 'TRANSACTION_REVERSED',
      performedByUid: params.adminUid,
      performedByName: params.adminName,
      performedByRole: 'super_admin',
      targetId: params.transactionId,
      targetType: 'transaction',
      details: `Reversed transaction ${params.transactionId} (৳${originalTxn.amount}) for member ${originalTxn.memberId}. Reason: ${params.reason}`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// 8. Get Member Transactions
export async function getMemberTransactions(memberUid: string): Promise<Transaction[]> {
  const path = 'transactions';
  try {
    const q = query(
      collection(db, 'transactions'),
      where('memberUid', '==', memberUid)
    );
    const snap = await getDocs(q);
    const list: Transaction[] = [];
    snap.forEach((d) => list.push(d.data() as Transaction));
    return list.sort((a, b) => new Date(b.entryTimestamp).getTime() - new Date(a.entryTimestamp).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// 9. Get All Transactions
export async function getAllTransactions(): Promise<Transaction[]> {
  const path = 'transactions';
  try {
    const snap = await getDocs(collection(db, 'transactions'));
    const list: Transaction[] = [];
    snap.forEach((d) => list.push(d.data() as Transaction));
    return list.sort((a, b) => new Date(b.entryTimestamp).getTime() - new Date(a.entryTimestamp).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// 10. Audit Logging
export async function logAuditEvent(event: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
  const id = `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString();
  const log: AuditLog = {
    ...event,
    id,
    timestamp: now,
  };
  try {
    await setDoc(doc(db, 'audit_logs', id), log);
  } catch (err) {
    console.warn('Failed to persist audit log to Firestore:', err);
  }
}

// 11. Get Audit Logs
export async function getAuditLogs(): Promise<AuditLog[]> {
  const path = 'audit_logs';
  try {
    const snap = await getDocs(collection(db, 'audit_logs'));
    const list: AuditLog[] = [];
    snap.forEach((d) => list.push(d.data() as AuditLog));
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// 12. Helper: Calculate member quarterly statuses and savings balance
export function calculateMemberQuarterlyDues(
  transactions: Transaction[],
  quarterlyDueAmount: number,
  fiscalYear: string
): {
  totalDeposited: number;
  totalSavingsBalance: number;
  confirmedCount: number;
  quarterStatuses: QuarterPaymentStatus[];
} {
  // Only non-reversal, confirmed transactions count as positive deposit
  const confirmed = transactions.filter((t) => t.status === 'confirmed' && !t.isReversal);
  const totalDeposited = confirmed.reduce((acc, t) => acc + t.amount, 0);

  // Reversals offset the balance
  const reversalTotal = transactions
    .filter((t) => t.isReversal)
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);
  const totalSavingsBalance = totalDeposited - reversalTotal;

  const quarters = [
    { q: `${fiscalYear}-Q1`, labelEn: 'Quarter 1 (Jan - Mar)', labelBn: '১ম ত্রৈমাসিক (জানু - মার্চ)', due: `${fiscalYear}-03-31` },
    { q: `${fiscalYear}-Q2`, labelEn: 'Quarter 2 (Apr - Jun)', labelBn: '২য় ত্রৈমাসিক (এপ্রিল - জুন)', due: `${fiscalYear}-06-30` },
    { q: `${fiscalYear}-Q3`, labelEn: 'Quarter 3 (Jul - Sep)', labelBn: '৩য় ত্রৈমাসিক (জুলাই - সেপ্টে)', due: `${fiscalYear}-09-30` },
    { q: `${fiscalYear}-Q4`, labelEn: 'Quarter 4 (Oct - Dec)', labelBn: '৪র্থ ত্রৈমাসিক (অক্টো - ডিসে)', due: `${fiscalYear}-12-31` },
  ];

  const now = new Date();

  const quarterStatuses: QuarterPaymentStatus[] = quarters.map((qObj) => {
    const qTxns = confirmed.filter((t) => t.quarter === qObj.q);
    const paidAmount = qTxns.reduce((sum, t) => sum + t.amount, 0);
    const dueDateObj = new Date(qObj.due);
    const isPastDue = now > dueDateObj;

    let status: QuarterPaymentStatus['status'] = 'unpaid';
    if (paidAmount >= quarterlyDueAmount) {
      status = 'paid';
    } else if (paidAmount > 0) {
      status = 'partial';
    } else if (isPastDue) {
      status = 'overdue';
    } else {
      status = 'unpaid';
    }

    return {
      quarter: qObj.q,
      quarterLabelEn: qObj.labelEn,
      quarterLabelBn: qObj.labelBn,
      dueAmount: quarterlyDueAmount,
      paidAmount,
      status,
      dueDate: qObj.due,
      transactions: qTxns,
    };
  });

  return {
    totalDeposited,
    totalSavingsBalance,
    confirmedCount: confirmed.length,
    quarterStatuses,
  };
}

// 13. Initial Bootstrapping: Pre-configure Super Admin and Society Parameters
export async function bootstrapSystemIfNeeded(user: { uid: string; email: string; displayName?: string }): Promise<UserProfile> {
  const existing = await getUserProfile(user.uid);
  if (existing) {
    // If user is the bootstrapped admin email and role isn't super_admin yet, elevate
    if (user.email.toLowerCase() === 'jonaedhassan324@gmail.com' && existing.role !== 'super_admin') {
      existing.role = 'super_admin';
      await saveUserProfile(existing);
    }
    return existing;
  }

  // Check if this is the bootstrapped admin
  const isSuperAdminEmail = user.email.toLowerCase() === 'jonaedhassan324@gmail.com';

  const defaultProfile: UserProfile = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || (isSuperAdminEmail ? 'Jonaed Hassan (Super Admin)' : 'Member User'),
    role: isSuperAdminEmail ? 'super_admin' : 'member',
    memberId: isSuperAdminEmail ? 'SC-ADM-001' : `SC-${Math.floor(100 + Math.random() * 900)}`,
    phone: '+880 1700-000000',
    permanentAddress: 'Dhaka, Bangladesh',
    currentCountry: 'Bangladesh',
    membershipStartDate: new Date().toISOString().split('T')[0],
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await saveUserProfile(defaultProfile);

  // Initialize general society config if it does not exist
  try {
    const configSnap = await getDoc(doc(db, 'society_config', 'general'));
    if (!configSnap.exists()) {
      await setDoc(doc(db, 'society_config', 'general'), DEFAULT_SOCIETY_CONFIG);
    }
  } catch (e) {
    console.warn('Error creating society_config doc:', e);
  }

  return defaultProfile;
}
