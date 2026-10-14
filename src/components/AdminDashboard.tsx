import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  UserProfile,
  Transaction,
  SocietyConfig,
  AuditLog,
  UserRole,
} from '../types';
import {
  getAllMembers,
  getAllTransactions,
  getAuditLogs,
  getSocietyConfig,
  updateSocietyConfig,
  saveUserProfile,
  reverseTransaction,
  calculateMemberQuarterlyDues,
} from '../services/societyService';
import {
  ShieldAlert,
  Users,
  Coins,
  TrendingUp,
  History,
  Settings,
  Search,
  Filter,
  UserPlus,
  RefreshCw,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  FileSpreadsheet,
  Calendar,
  Lock,
  ChevronDown,
} from 'lucide-react';
import { ReceiptModal } from './ReceiptModal';
import { StatementModal } from './StatementModal';

export const AdminDashboard: React.FC = () => {
  const { userProfile, role, language } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'corrections' | 'audit_logs' | 'settings'>('overview');
  
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [config, setConfig] = useState<SocietyConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [memberSearch, setMemberSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Correction / Reversal State
  const [selectedTxnForReversal, setSelectedTxnForReversal] = useState<Transaction | null>(null);
  const [reversalReason, setReversalReason] = useState('');
  const [reversing, setReversing] = useState(false);
  const [correctionError, setCorrectionError] = useState<string | null>(null);

  // Member Edit / Create Modal State
  const [editingMember, setEditingMember] = useState<UserProfile | null>(null);
  const [isCreatingMember, setIsCreatingMember] = useState(false);
  const [newMemberForm, setNewMemberForm] = useState<Partial<UserProfile>>({
    displayName: '',
    email: '',
    role: 'member',
    phone: '',
    permanentAddress: '',
    currentCountry: 'Bangladesh',
    status: 'active',
  });

  // Settings Form State
  const [dueAmountInput, setDueAmountInput] = useState<number>(3000);
  const [activeQuarterInput, setActiveQuarterInput] = useState<string>('2026-Q1');
  const [fiscalYearInput, setFiscalYearInput] = useState<string>('2026');
  const [savingSettings, setSavingSettings] = useState(false);

  // Modals
  const [viewReceiptTxn, setViewReceiptTxn] = useState<Transaction | null>(null);
  const [viewStatementMember, setViewStatementMember] = useState<UserProfile | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allM, allT, allA, cfg] = await Promise.all([
        getAllMembers(),
        getAllTransactions(),
        getAuditLogs(),
        getSocietyConfig(),
      ]);
      setMembers(allM);
      setTransactions(allT);
      setAuditLogs(allA);
      setConfig(cfg);
      if (cfg) {
        setDueAmountInput(cfg.quarterlyDueAmount);
        setActiveQuarterInput(cfg.activeQuarter);
        setFiscalYearInput(cfg.currentFiscalYear);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Financial Computations
  const confirmedTxns = transactions.filter((t) => t.status === 'confirmed' && !t.isReversal);
  const totalSocietyDeposits = confirmedTxns.reduce((sum, t) => sum + t.amount, 0);
  const reversalTotal = transactions
    .filter((t) => t.isReversal)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const netSocietySavings = totalSocietyDeposits - reversalTotal;

  const activeMembersCount = members.filter((m) => m.status === 'active').length;
  const inactiveMembersCount = members.filter((m) => m.status !== 'active').length;

  // Active Quarter Collection Metric
  const currentQTxns = confirmedTxns.filter((t) => t.quarter === (config?.activeQuarter || '2026-Q1'));
  const currentQCollection = currentQTxns.reduce((sum, t) => sum + t.amount, 0);
  const currentQTarget = activeMembersCount * (config?.quarterlyDueAmount || 3000);
  const collectionRate = currentQTarget > 0 ? Math.round((currentQCollection / currentQTarget) * 100) : 0;

  // Handle Reversal Submission
  const handleConfirmReversal = async () => {
    if (!selectedTxnForReversal || !userProfile) return;
    if (!reversalReason.trim()) {
      setCorrectionError(language === 'bn' ? 'সংশোধনের কারণ স্পষ্টভাবে উল্লেখ করতে হবে।' : 'A detailed correction reason is mandatory.');
      return;
    }

    setReversing(true);
    setCorrectionError(null);
    try {
      await reverseTransaction({
        transactionId: selectedTxnForReversal.transactionId,
        reason: reversalReason.trim(),
        adminUid: userProfile.uid,
        adminName: userProfile.displayName,
      });

      setSelectedTxnForReversal(null);
      setReversalReason('');
      await loadData();
    } catch (err: unknown) {
      console.error('Failed to reverse transaction:', err);
      setCorrectionError(err instanceof Error ? err.message : String(err));
    } finally {
      setReversing(false);
    }
  };

  // Handle Save Member Edit / Role Change
  const handleSaveMemberEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember || !userProfile) return;
    try {
      await saveUserProfile(editingMember, {
        uid: userProfile.uid,
        name: userProfile.displayName,
        role: 'super_admin',
      });
      setEditingMember(null);
      await loadData();
    } catch (err) {
      console.error('Failed to update member:', err);
    }
  };

  // Handle Create New Member
  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    const uid = `USR-${Date.now()}`;
    const nextMemberNum = members.length + 101;
    const newProfile: UserProfile = {
      uid,
      email: newMemberForm.email || `member${nextMemberNum}@shopnerchura.org`,
      displayName: newMemberForm.displayName || 'Unnamed Member',
      role: (newMemberForm.role as UserRole) || 'member',
      memberId: `SC-${nextMemberNum}`,
      phone: newMemberForm.phone || '+880 1700-000000',
      permanentAddress: newMemberForm.permanentAddress || 'Dhaka, Bangladesh',
      currentCountry: newMemberForm.currentCountry || 'Bangladesh',
      membershipStartDate: new Date().toISOString().split('T')[0],
      status: (newMemberForm.status as UserProfile['status']) || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveUserProfile(newProfile, {
        uid: userProfile.uid,
        name: userProfile.displayName,
        role: 'super_admin',
      });
      setIsCreatingMember(false);
      setNewMemberForm({ displayName: '', email: '', role: 'member', status: 'active' });
      await loadData();
    } catch (err) {
      console.error('Failed to create member:', err);
    }
  };

  // Handle Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    setSavingSettings(true);
    try {
      await updateSocietyConfig(
        {
          quarterlyDueAmount: Number(dueAmountInput),
          activeQuarter: activeQuarterInput,
          currentFiscalYear: fiscalYearInput,
        },
        userProfile.uid,
        userProfile.displayName
      );
      await loadData();
    } catch (err) {
      console.error('Failed to update config:', err);
    } finally {
      setSavingSettings(false);
    }
  };

  const filteredMembers = members.filter((m) => {
    const q = memberSearch.toLowerCase();
    const matchesSearch =
      !q ||
      m.displayName?.toLowerCase().includes(q) ||
      m.memberId?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.phone?.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && m.status === 'active') ||
      (statusFilter === 'inactive' && m.status !== 'active');

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Admin Top Navigation & Header */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-white">
              {language === 'bn' ? 'সুপার এডমিন কন্ট্রোল প্যানেল' : 'Super Admin Control Center'}
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-500/30">
              {language === 'bn' ? 'পূর্ণাঙ্গ ক্ষমতা' : 'Full Control'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'bn'
              ? 'সমিতির মোট তহবিল, সদস্য ও অপারেটর অনুমতি, অডিট লগ এবং ভুল সংশোধনের সর্বোচ্চ কর্তৃত্ব'
              : 'Society total balances, member permissions, audit logs, and controlled financial corrections'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Refresh All Records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Admin Subtabs */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/70 p-1.5 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'overview' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          {language === 'bn' ? 'সার্বিক ফান্ড ও অগ্রগতি' : 'Society Fund & Progress'}
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'members' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          {language === 'bn' ? 'সদস্য ও অপারেটর নিয়ন্ত্রণ' : 'Members & Operators'}
        </button>

        <button
          onClick={() => setActiveTab('corrections')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'corrections' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'ভুল সংশোধন ও রিভার্সাল' : 'Financial Corrections'}</span>
        </button>

        <button
          onClick={() => setActiveTab('audit_logs')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'audit_logs' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'অডিট লগ (Audit Log)' : 'Audit Logs'}</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'settings' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'সমিতির সেটিংস' : 'Parameters'}</span>
        </button>
      </div>

      {/* Tab: Overview (Total Society Balances & Quarterly Collection) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Net Society Savings */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/60 to-slate-900 border border-purple-500/30 space-y-2">
              <span className="text-[11px] uppercase font-bold text-purple-300">
                {language === 'bn' ? 'সমিতির মোট নিট সঞ্চয় স্থিতি' : 'Total Society Net Savings'}
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white flex items-baseline gap-1">
                <span className="text-purple-400 font-bold">৳</span>
                <span>{netSocietySavings.toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-slate-400">
                {language === 'bn' ? `মোট জমা: ৳${totalSocietyDeposits.toLocaleString()}` : `Total verified: ৳${totalSocietyDeposits.toLocaleString()}`}
              </p>
            </div>

            {/* Total Registered Members */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-[11px] uppercase font-bold text-slate-400">
                {language === 'bn' ? 'নিবন্ধিত সদস্য সংখ্যা' : 'Registered Members'}
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {members.length} <span className="text-xs font-normal text-slate-400">{language === 'bn' ? 'জন' : 'members'}</span>
              </div>
              <p className="text-[10px] text-emerald-400">
                {activeMembersCount} {language === 'bn' ? 'জন সক্রিয়' : 'Active'} • {inactiveMembersCount} {language === 'bn' ? 'জন নিষ্ক্রিয়' : 'Inactive'}
              </p>
            </div>

            {/* Current Quarter Progress */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-[11px] uppercase font-bold text-slate-400">
                {config?.activeQuarter || '2026-Q1'} {language === 'bn' ? 'কিস্তি আদায়' : 'Quarter Collection'}
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                ৳{currentQCollection.toLocaleString()}
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{language === 'bn' ? 'টার্গেট:' : 'Target:'} ৳{currentQTarget.toLocaleString()}</span>
                  <span>{collectionRate}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${Math.min(100, collectionRate)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Total Transactions & Reversals */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-[11px] uppercase font-bold text-slate-400">
                {language === 'bn' ? 'মোট ভেরিফাইড লেনদেন' : 'Transaction Records'}
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {transactions.length} <span className="text-xs font-normal text-slate-400">{language === 'bn' ? 'টি' : 'records'}</span>
              </div>
              <p className="text-[10px] text-slate-400">
                {confirmedTxns.length} {language === 'bn' ? 'গৃহীত' : 'Confirmed'} • {reversalTotal > 0 ? `৳${reversalTotal.toLocaleString()} রিভার্স` : '0 রিভার্স'}
              </p>
            </div>
          </div>

          {/* Member-wise Savings & Payment Status Quick Table */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white">
                  {language === 'bn' ? 'সদস্যভিত্তিক সঞ্চয় হিসাব বিবরণী ও কিস্তির অবস্থা' : 'Member-wise Savings Status Report'}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'bn' ? 'সরাসরি প্রত্যেক সদস্যের পাসবুক ও ব্যালেন্স পর্যবেক্ষণ করুন' : 'Live balance breakdown and quarterly dues per member'}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 bg-slate-950/60">
                    <th className="py-3 px-4">আইডি (ID)</th>
                    <th className="py-3 px-4">{language === 'bn' ? 'সদস্যের নাম' : 'Member Name'}</th>
                    <th className="py-3 px-4">{language === 'bn' ? 'রোল' : 'Role'}</th>
                    <th className="py-3 px-4 text-right">{language === 'bn' ? 'মোট সঞ্চয়' : 'Total Savings'}</th>
                    <th className="py-3 px-4 text-center">{language === 'bn' ? 'কিস্তি স্ট্যাটাস' : 'Quarter Status'}</th>
                    <th className="py-3 px-4 text-center">{language === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {members.map((m) => {
                    const mTxns = transactions.filter((t) => t.memberUid === m.uid);
                    const duesData = calculateMemberQuarterlyDues(
                      mTxns,
                      config?.quarterlyDueAmount || 3000,
                      config?.currentFiscalYear || '2026'
                    );

                    const activeQ = duesData.quarterStatuses.find((q) => q.quarter === (config?.activeQuarter || '2026-Q1'));
                    const isPaidActiveQ = activeQ?.status === 'paid';

                    return (
                      <tr key={m.uid} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400">{m.memberId}</td>
                        <td className="py-3 px-4 font-semibold text-white">
                          <div>{m.displayName}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{m.phone || m.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {m.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-400">
                          ৳{duesData.totalSavingsBalance.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isPaidActiveQ ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                              {language === 'bn' ? 'পরিশোধিত' : 'Paid'}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800/50">
                              {language === 'bn' ? 'বকেয়া' : 'Due'}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setViewStatementMember(m)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
                          >
                            {language === 'bn' ? 'পাসবুক' : 'Statement'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Members & Operators Management */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">
                {language === 'bn' ? 'সদস্য ও অপারেটর ব্যবস্থাপনা' : 'Member & Role Management'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'bn' ? 'সদস্যের তথ্য হালনাগাদ, রোল পরিবর্তন এবং অনুমতি প্রদান' : 'Manage member details, assign operator/admin roles, and toggle status'}
              </p>
            </div>
            <button
              onClick={() => setIsCreatingMember(true)}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow"
            >
              <UserPlus className="w-4 h-4" />
              <span>{language === 'bn' ? 'নতুন সদস্য যুক্ত করুন' : 'Add New Member'}</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder={language === 'bn' ? 'নাম, সদস্য আইডি বা মোবাইল দিয়ে খুঁজুন...' : 'Search by name, ID, or phone...'}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="all">{language === 'bn' ? 'সকল স্ট্যাটাস' : 'All Status'}</option>
                <option value="active">{language === 'bn' ? 'সক্রিয় (Active)' : 'Active'}</option>
                <option value="inactive">{language === 'bn' ? 'নিষ্ক্রিয় (Inactive)' : 'Inactive'}</option>
              </select>
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 bg-slate-950/60">
                    <th className="py-3 px-4">আইডি</th>
                    <th className="py-3 px-4">নাম ও যোগাযোগ</th>
                    <th className="py-3 px-4">স্থায়ী ঠিকানা</th>
                    <th className="py-3 px-4">রোল ও অধিকার</th>
                    <th className="py-3 px-4">নমিনী</th>
                    <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                    <th className="py-3 px-4 text-center">সম্পাদনা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredMembers.map((m) => (
                    <tr key={m.uid} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">{m.memberId}</td>
                      <td className="py-3 px-4 font-semibold text-white">
                        <div>{m.displayName}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{m.email} • {m.phone}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-[180px] truncate">{m.permanentAddress || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                            m.role === 'super_admin'
                              ? 'bg-purple-950/70 border-purple-500/30 text-purple-300'
                              : m.role === 'entry_operator'
                              ? 'bg-blue-950/70 border-blue-500/30 text-blue-300'
                              : 'bg-emerald-950/70 border-emerald-500/30 text-emerald-300'
                          }`}
                        >
                          {m.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {m.nomineeName ? `${m.nomineeName} (${m.nomineeRelation || ''})` : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            m.status === 'active'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                              : 'bg-red-950 text-red-400 border border-red-800/50'
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setEditingMember(m)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
                        >
                          {language === 'bn' ? 'রোল/তথ্য পরিবর্তন' : 'Edit'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Financial Corrections & Controlled Reversal */}
      {activeTab === 'corrections' && (
        <div className="space-y-4">
          <div className="bg-amber-950/20 border border-amber-500/30 p-4 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <h4 className="font-bold text-amber-300">
                {language === 'bn' ? 'আর্থিক সংশোধন ও অডিট নীতি' : 'Financial Correction & Audit Policy'}
              </h4>
              <p className="text-slate-300 mt-1">
                {language === 'bn'
                  ? 'সমিতির কোনো আর্থিক লেনদেন কখনো সরাসরি ডিলিট বা মুছে ফেলা যাবে না। ভুল এন্ট্রি সংশোধনের জন্য একটি অডিট-লগযুক্ত রিভার্সাল (Reversal) তৈরি হবে যা মূল লেনদেনের রেকর্ড অক্ষুণ্ণ রেখে ব্যালেন্স সংশোধন করবে।'
                  : 'Financial records are never silently overwritten or deleted. Corrections are made strictly through an auditable offsetting reversal record.'}
              </p>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">
                {language === 'bn' ? 'সকল লেনদেনের তালিকা ও সংশোধন' : 'Transaction Registry & Correction Actions'}
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 bg-slate-950/60">
                    <th className="py-3 px-4">ট্রানজেকশন আইডি</th>
                    <th className="py-3 px-4">সদস্য</th>
                    <th className="py-3 px-4">ত্রৈমাসিক</th>
                    <th className="py-3 px-4 text-right">পরিমাণ</th>
                    <th className="py-3 px-4">অপারেটর</th>
                    <th className="py-3 px-4 text-center">অবস্থা</th>
                    <th className="py-3 px-4 text-center">সংশোধন অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {transactions.map((txn) => {
                    const isRev = txn.status === 'reversed' || txn.isReversal;
                    return (
                      <tr key={txn.id || txn.transactionId} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                          {txn.transactionId}
                        </td>
                        <td className="py-3 px-4 text-white font-medium">
                          {txn.memberName} ({txn.memberId})
                        </td>
                        <td className="py-3 px-4 text-slate-300">{txn.quarter}</td>
                        <td className={`py-3 px-4 text-right font-bold ${isRev ? 'text-red-400' : 'text-emerald-400'}`}>
                          {isRev ? '-' : '+'}৳{Math.abs(txn.amount).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-slate-400">{txn.operatorName}</td>
                        <td className="py-3 px-4 text-center">
                          {isRev ? (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-red-950 text-red-400 border border-red-800/50">
                              {language === 'bn' ? 'রিভার্সড' : 'Reversed'}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                              {language === 'bn' ? 'গৃহীত' : 'Confirmed'}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {!isRev ? (
                            <button
                              onClick={() => {
                                setSelectedTxnForReversal(txn);
                                setCorrectionError(null);
                                setReversalReason('');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 text-xs font-semibold border border-red-800/50 transition-colors"
                            >
                              {language === 'bn' ? 'সংশোধন / রিভার্স' : 'Reverse / Correct'}
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-500 italic">
                              {txn.reversalReason ? `"${txn.reversalReason}"` : 'Corrected'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Immutable Audit Logs */}
      {activeTab === 'audit_logs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">
                {language === 'bn' ? 'সমিতির পূর্ণাঙ্গ অডিট লগ' : 'System Audit Log Registry'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'bn' ? 'প্রত্যেকটি জমা, পরিবর্তন, রিভার্সাল ও রোল পরিবর্তনের অপরিবর্তনীয় প্রমাণ' : 'Immutable audit trail of all financial, member, and permission actions'}
              </p>
            </div>
            <span className="text-xs font-mono text-purple-400 bg-purple-950 px-2.5 py-1 rounded-lg border border-purple-500/30">
              {auditLogs.length} {language === 'bn' ? 'টি অডিট ইভেন্ট' : 'logged events'}
            </span>
          </div>

          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 bg-slate-950/60">
                    <th className="py-3 px-4">{language === 'bn' ? 'সময়' : 'Timestamp'}</th>
                    <th className="py-3 px-4">{language === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
                    <th className="py-3 px-4">{language === 'bn' ? 'সম্পাদনকারী' : 'Actor'}</th>
                    <th className="py-3 px-4">{language === 'bn' ? 'টার্গেট' : 'Target'}</th>
                    <th className="py-3 px-4">{language === 'bn' ? 'বিবরণ' : 'Details'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        {language === 'bn' ? 'কোনো অডিট লগ রেকর্ড পাওয়া যায়নি।' : 'No audit records yet.'}
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-white font-medium">
                          {log.performedByName} ({log.performedByRole})
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300">{log.targetId}</td>
                        <td className="py-3 px-4 text-slate-300 max-w-sm">{log.details}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Society Settings */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4 max-w-2xl">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white">
              {language === 'bn' ? 'ত্রৈমাসিক সঞ্চয় প্যারামিটার ও সাধারণ সেটিংস' : 'Quarterly Parameters & Settings'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'bn' ? 'কিস্তির টাকা এবং বর্তমান সক্রিয় ত্রৈমাসিক নির্ধারণ করুন' : 'Configure quarterly due amount and fiscal periods'}
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                {language === 'bn' ? 'ত্রৈমাসিক নির্ধারিত সঞ্চয়ের পরিমাণ (টাকা / BDT)' : 'Quarterly Due Amount (BDT)'}
              </label>
              <input
                type="number"
                min="500"
                step="500"
                value={dueAmountInput}
                onChange={(e) => setDueAmountInput(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  {language === 'bn' ? 'বর্তমান সক্রিয় ত্রৈমাসিক' : 'Active Quarter'}
                </label>
                <select
                  value={activeQuarterInput}
                  onChange={(e) => setActiveQuarterInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="2026-Q1">2026-Q1</option>
                  <option value="2026-Q2">2026-Q2</option>
                  <option value="2026-Q3">2026-Q3</option>
                  <option value="2026-Q4">2026-Q4</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  {language === 'bn' ? 'অর্থবছর' : 'Fiscal Year'}
                </label>
                <input
                  type="text"
                  value={fiscalYearInput}
                  onChange={(e) => setFiscalYearInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingSettings}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow transition-colors flex items-center gap-1.5"
            >
              {savingSettings ? (
                <span>{language === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...'}</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'bn' ? 'সেটিংস সংরক্ষণ করুন' : 'Save Parameters'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Modal: Controlled Financial Reversal */}
      {selectedTxnForReversal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">
                  {language === 'bn' ? 'আর্থিক লেনদেন রিভার্সাল / সংশোধন' : 'Financial Reversal & Correction'}
                </h4>
                <p className="text-xs text-slate-400">
                  {language === 'bn' ? 'মূল রেকর্ড অক্ষুণ্ণ রেখে অফসেট রিভার্সাল তৈরি হবে' : 'Controlled correction creates an audited offsetting reversal'}
                </p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Txn ID:</span>
                <span className="font-mono font-bold text-emerald-400">{selectedTxnForReversal.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{language === 'bn' ? 'সদস্য:' : 'Member:'}</span>
                <span className="font-bold text-white">{selectedTxnForReversal.memberName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{language === 'bn' ? 'ত্রৈমাসিক:' : 'Quarter:'}</span>
                <span className="font-medium text-slate-200">{selectedTxnForReversal.quarter}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-slate-800 font-bold">
                <span className="text-slate-300">{language === 'bn' ? 'রিভার্স পরিমাণ:' : 'Reversal Amount:'}</span>
                <span className="text-red-400">-৳{selectedTxnForReversal.amount.toLocaleString()}</span>
              </div>
            </div>

            {correctionError && (
              <p className="text-xs text-red-400 bg-red-950/40 p-2.5 rounded-xl border border-red-800/40">
                {correctionError}
              </p>
            )}

            <div className="text-xs">
              <label className="block text-slate-400 font-semibold mb-1">
                {language === 'bn' ? 'সংশোধনের কারণ (বাধ্যতামূলক অডিট নোট):' : 'Mandatory Correction Audit Reason:'}
              </label>
              <textarea
                rows={3}
                value={reversalReason}
                onChange={(e) => setReversalReason(e.target.value)}
                placeholder={language === 'bn' ? 'যেমন: ভুলবশত অন্য সদস্যের হিসাবে এন্ট্রি হয়েছিল, ব্যাংকের ভাউচার অনুযায়ী সংশোধন' : 'e.g. Inadvertent duplicate entry or incorrect member account entered'}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedTxnForReversal(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmReversal}
                disabled={reversing}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow flex items-center justify-center gap-1.5"
              >
                {reversing ? <span>Processing...</span> : <span>Confirm Reversal</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Member & Permissions */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form onSubmit={handleSaveMemberEdit} className="w-full max-w-lg bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="border-b border-slate-800 pb-3">
              <h4 className="text-base font-bold text-white">
                {language === 'bn' ? 'সদস্যের তথ্য ও রোল পরিবর্তন' : 'Edit Member & Access Role'}
              </h4>
              <p className="text-xs text-slate-400">{editingMember.displayName} ({editingMember.memberId})</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">{language === 'bn' ? 'পূর্ণ নাম' : 'Display Name'}</label>
                <input
                  type="text"
                  value={editingMember.displayName}
                  onChange={(e) => setEditingMember({ ...editingMember, displayName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">{language === 'bn' ? 'মোবাইল' : 'Phone'}</label>
                <input
                  type="text"
                  value={editingMember.phone || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">{language === 'bn' ? 'ব্যবহারকারী রোল' : 'System Role'}</label>
                <select
                  value={editingMember.role}
                  onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                >
                  <option value="member">{language === 'bn' ? 'সাধারণ সদস্য (Member)' : 'Member'}</option>
                  <option value="entry_operator">{language === 'bn' ? 'এন্ট্রি অপারেটর (Entry Operator)' : 'Entry Operator'}</option>
                  <option value="super_admin">{language === 'bn' ? 'সুপার এডমিন (Super Admin)' : 'Super Admin'}</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">{language === 'bn' ? 'হিসাব স্ট্যাটাস' : 'Status'}</label>
                <select
                  value={editingMember.status}
                  onChange={(e) => setEditingMember({ ...editingMember, status: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                >
                  <option value="active">Active (সক্রিয়)</option>
                  <option value="inactive">Inactive (নিষ্ক্রিয়)</option>
                  <option value="suspended">Suspended (স্থগিত)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
              >
                {language === 'bn' ? 'সংরক্ষণ করুন' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Create New Member */}
      {isCreatingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form onSubmit={handleCreateMember} className="w-full max-w-lg bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="border-b border-slate-800 pb-3">
              <h4 className="text-base font-bold text-white">
                {language === 'bn' ? 'নতুন সদস্য নিবন্ধন' : 'Register New Member'}
              </h4>
              <p className="text-xs text-slate-400">
                {language === 'bn' ? 'নতুন সঞ্চয়ী সদস্যের তথ্য ও পরিচিতি তৈরি করুন' : 'Create profile and generate membership ID'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">{language === 'bn' ? 'সদস্যের নাম' : 'Full Name'}</label>
                <input
                  type="text"
                  required
                  value={newMemberForm.displayName || ''}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, displayName: e.target.value })}
                  placeholder="e.g. Md. Tariqul Islam"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">{language === 'bn' ? 'ইমেইল' : 'Email Address'}</label>
                <input
                  type="email"
                  value={newMemberForm.email || ''}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, email: e.target.value })}
                  placeholder="tariqul@example.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">{language === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}</label>
                <input
                  type="text"
                  value={newMemberForm.phone || ''}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, phone: e.target.value })}
                  placeholder="+880 1712-000000"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">{language === 'bn' ? 'রোল' : 'Role'}</label>
                <select
                  value={newMemberForm.role}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, role: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="member">Member</option>
                  <option value="entry_operator">Entry Operator</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1">{language === 'bn' ? 'স্থায়ী ঠিকানা' : 'Permanent Address'}</label>
                <input
                  type="text"
                  value={newMemberForm.permanentAddress || ''}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, permanentAddress: e.target.value })}
                  placeholder="Village, Post Office, Upazila, District"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreatingMember(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
              >
                {language === 'bn' ? 'নিবন্ধন সম্পন্ন করুন' : 'Register Member'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Member Passbook Modal */}
      {viewStatementMember && config && (
        <StatementModal
          member={viewStatementMember}
          transactions={transactions.filter((t) => t.memberUid === viewStatementMember.uid)}
          config={config}
          language={language}
          onClose={() => setViewStatementMember(null)}
        />
      )}
    </div>
  );
};
