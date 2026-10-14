import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  UserProfile,
  Transaction,
  SocietyConfig,
  QuarterPaymentStatus,
} from '../types';
import {
  getMemberTransactions,
  calculateMemberQuarterlyDues,
  getSocietyConfig,
  saveUserProfile,
} from '../services/societyService';
import {
  Wallet,
  TrendingUp,
  Clock,
  Calendar,
  CreditCard,
  FileText,
  User,
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  Printer,
  ChevronRight,
  Share2,
  RefreshCw,
  Phone,
  MapPin,
  Globe2,
  Heart,
  Edit3,
} from 'lucide-react';
import { ReceiptModal } from './ReceiptModal';
import { StatementModal } from './StatementModal';

export const MemberDashboard: React.FC = () => {
  const { userProfile, currentUser, language, refreshProfile } = useAuth();
  const [config, setConfig] = useState<SocietyConfig | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [showStatement, setShowStatement] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'profile'>('overview');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<UserProfile>>({});

  const loadData = async () => {
    if (!userProfile) return;
    setLoading(true);
    try {
      const cfg = await getSocietyConfig();
      setConfig(cfg);
      const txns = await getMemberTransactions(userProfile.uid);
      setTransactions(txns);
    } catch (err) {
      console.error('Error loading member data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userProfile?.uid]);

  const quarterlyDueAmount = config?.quarterlyDueAmount || 3000;
  const currentFiscalYear = config?.currentFiscalYear || '2026';

  const { totalDeposited, totalSavingsBalance, confirmedCount, quarterStatuses } =
    calculateMemberQuarterlyDues(transactions, quarterlyDueAmount, currentFiscalYear);

  // Next due calculation
  const nextOverdueOrUnpaid = quarterStatuses.find((q) => q.status === 'unpaid' || q.status === 'overdue' || q.status === 'partial');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    try {
      await saveUserProfile({
        ...userProfile,
        ...editFormData,
      });
      await refreshProfile();
      setIsEditingProfile(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  if (!userProfile) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>{language === 'bn' ? 'সদস্য তথ্য লোড হচ্ছে...' : 'Loading member profile...'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome & Notification Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-emerald-950/50">
            {userProfile.displayName.slice(0, 1)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{userProfile.displayName}</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                {userProfile.memberId}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {language === 'bn' ? 'সদস্যপদ শুরু: ' : 'Member since: '} {userProfile.membershipStartDate} • {userProfile.currentCountry}
            </p>
          </div>
        </div>

        {/* Quick Tabs on top */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'overview' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {language === 'bn' ? 'সারসংক্ষেপ' : 'Overview'}
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'transactions' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {language === 'bn' ? 'লেনদেন তালিকা' : 'Passbook'}
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'profile' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {language === 'bn' ? 'প্রোফাইল ও নমিনী' : 'Profile'}
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Hero Banking Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950 p-6 sm:p-7 border border-emerald-500/30 shadow-2xl">
            {/* Ambient Background decoration */}
            <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-xs uppercase font-bold tracking-wider text-emerald-300">
                    {language === 'bn' ? 'স্বপ্নের চূড়া সঞ্চয় হিসাব' : 'Shopner Chura Savings Account'}
                  </span>
                </div>
                <button
                  onClick={loadData}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-300 transition-colors"
                  title="Refresh Balance"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div>
                <span className="text-xs text-emerald-200/80 font-medium">
                  {language === 'bn' ? 'মোট জমাকৃত সঞ্চয় স্থিতি' : 'Total Accumulated Savings'}
                </span>
                <div className="text-4xl sm:text-5xl font-black text-white mt-1 tracking-tight flex items-baseline gap-1">
                  <span className="text-emerald-400 font-bold">৳</span>
                  <span>{totalSavingsBalance.toLocaleString()}</span>
                  <span className="text-xs font-semibold text-emerald-400/80 ml-2">BDT</span>
                </div>
                <p className="text-[11px] text-emerald-300/80 mt-1">
                  {language === 'bn'
                    ? `মোট অনুমোদিত জমা: ৳${totalDeposited.toLocaleString()} (${confirmedCount} টি কিস্তি)`
                    : `Verified total deposits: ৳${totalDeposited.toLocaleString()} (${confirmedCount} installments)`}
                </p>
              </div>

              <div className="pt-4 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    {language === 'bn' ? 'পরবর্তী কিস্তির সময়সীমা' : 'Next Due Date'}
                  </span>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{nextOverdueOrUnpaid ? nextOverdueOrUnpaid.dueDate : 'All Quarters Paid!'}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowStatement(true)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-950/60"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'বিবরণী ডাউনলোড' : 'Statement'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quarterly Status Grid (4 Quarters of the Fiscal Year) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>
                  {language === 'bn'
                    ? `${currentFiscalYear} অর্থবছর - ত্রৈমাসিক কিস্তি অবস্থা`
                    : `${currentFiscalYear} Fiscal Year - Quarterly Due Status`}
                </span>
              </h3>
              <span className="text-xs text-slate-400">
                {language === 'bn' ? `প্রতি কিস্তি: ৳${quarterlyDueAmount}` : `Quarterly: ৳${quarterlyDueAmount}`}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {quarterStatuses.map((q) => {
                const isPaid = q.status === 'paid';
                const isPartial = q.status === 'partial';
                const isOverdue = q.status === 'overdue';

                const badgeStyles = isPaid
                  ? 'bg-emerald-950/70 text-emerald-400 border-emerald-500/30'
                  : isPartial
                  ? 'bg-amber-950/70 text-amber-400 border-amber-500/30'
                  : isOverdue
                  ? 'bg-red-950/70 text-red-400 border-red-500/30'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700/60';

                const statusLabel = isPaid
                  ? (language === 'bn' ? 'পরিশোধিত' : 'Paid')
                  : isPartial
                  ? (language === 'bn' ? 'আংশিক পরিশোধ' : 'Partial')
                  : isOverdue
                  ? (language === 'bn' ? 'বকেয়া / মেয়াদোত্তীর্ণ' : 'Overdue')
                  : (language === 'bn' ? 'অপরিশোধিত' : 'Unpaid');

                return (
                  <div
                    key={q.quarter}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-slate-400">{q.quarter}</span>
                        <h4 className="text-xs font-bold text-white mt-0.5">
                          {language === 'bn' ? q.quarterLabelBn : q.quarterLabelEn}
                        </h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeStyles}`}>
                        {statusLabel}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">{language === 'bn' ? 'জমা:' : 'Paid:'}</span>
                        <span className="font-bold text-white">৳{q.paidAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">{language === 'bn' ? 'নির্ধারিত:' : 'Target:'}</span>
                        <span className="text-slate-400">৳{q.dueAmount.toLocaleString()}</span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full rounded-full ${isPaid ? 'bg-emerald-500' : isPartial ? 'bg-amber-400' : isOverdue ? 'bg-red-500' : 'bg-slate-700'}`}
                          style={{ width: `${Math.min(100, (q.paidAmount / q.dueAmount) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex justify-between">
                      <span>{language === 'bn' ? 'শেষ তারিখ:' : 'Due by:'}</span>
                      <span className={isOverdue ? 'text-red-400 font-bold' : 'text-slate-300'}>{q.dueDate}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Deposits & Receipts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>{language === 'bn' ? 'সাম্প্রতিক জমার রশিদসমূহ' : 'Recent Deposit Receipts'}</span>
              </h3>
              <button
                onClick={() => setActiveTab('transactions')}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
              >
                <span>{language === 'bn' ? 'সকল দেখুন' : 'View All'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {transactions.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400">
                <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-xs">
                  {language === 'bn'
                    ? 'আপনার হিসাবে এখনো কোনো জমার তথ্য এন্ট্রি করা হয়নি।'
                    : 'No deposits recorded for your account yet.'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {language === 'bn'
                    ? 'অপারেটর বা এডমিন সঞ্চয় জমা নেওয়ার পর রশিদ এখানে প্রদর্শিত হবে।'
                    : 'Official receipts will show here once an operator records your contribution.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.slice(0, 4).map((txn) => {
                  const isRev = txn.status === 'reversed' || txn.isReversal;
                  return (
                    <div
                      key={txn.id || txn.transactionId}
                      className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isRev ? 'bg-red-950/60 text-red-400 border border-red-500/20' : 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {isRev ? 'REV' : 'DEP'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-white">{txn.transactionId}</span>
                            <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                              {txn.quarter}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {txn.depositDate} • {txn.paymentMethod.toUpperCase()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className={`text-sm font-bold ${isRev ? 'text-red-400' : 'text-emerald-400'}`}>
                            {isRev ? '-' : '+'}৳{Math.abs(txn.amount).toLocaleString()}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            {isRev ? (language === 'bn' ? 'সংশোধিত' : 'Reversed') : (language === 'bn' ? 'গৃহীত' : 'Confirmed')}
                          </span>
                        </div>
                        <button
                          onClick={() => setSelectedTxn(txn)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="hidden sm:inline">{language === 'bn' ? 'রশিদ' : 'Receipt'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Tab: Full Passbook Transactions */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">
                {language === 'bn' ? 'ডিজিটাল সঞ্চয় খতিয়ান (পাসবুক)' : 'Digital Savings Passbook'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'bn' ? 'সকল অনুমোদিত ত্রৈমাসিক সঞ্চয় ও রশিদের তালিকা' : 'Full history of verified quarterly contributions'}
              </p>
            </div>
            <button
              onClick={() => setShowStatement(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'পূর্ণাঙ্গ বিবরণী প্রিন্ট' : 'Print Statement'}</span>
            </button>
          </div>

          <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 bg-slate-950/60">
                    <th className="py-3 px-4">{language === 'bn' ? 'তারিখ' : 'Date'}</th>
                    <th className="py-3 px-4">{language === 'bn' ? 'ট্রানজেকশন আইডি' : 'Txn ID'}</th>
                    <th className="py-3 px-4">{language === 'bn' ? 'কিস্তি' : 'Quarter'}</th>
                    <th className="py-3 px-4">{language === 'bn' ? 'মাধ্যম' : 'Method'}</th>
                    <th className="py-3 px-4 text-right">{language === 'bn' ? 'পরিমাণ' : 'Amount'}</th>
                    <th className="py-3 px-4 text-center">{language === 'bn' ? 'অবস্থা' : 'Status'}</th>
                    <th className="py-3 px-4 text-center">{language === 'bn' ? 'রশিদ' : 'Receipt'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        {language === 'bn' ? 'কোনো লেনদেন পাওয়া যায়নি' : 'No transactions recorded yet'}
                      </td>
                    </tr>
                  ) : (
                    transactions.map((txn) => {
                      const isRev = txn.status === 'reversed' || txn.isReversal;
                      return (
                        <tr key={txn.id || txn.transactionId} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-medium text-slate-200">{txn.depositDate}</td>
                          <td className="py-3 px-4 font-mono text-[11px] text-emerald-400">{txn.transactionId}</td>
                          <td className="py-3 px-4 text-slate-200 font-semibold">{txn.quarter}</td>
                          <td className="py-3 px-4 uppercase text-[10px] text-slate-400">{txn.paymentMethod}</td>
                          <td className={`py-3 px-4 text-right font-bold ${isRev ? 'text-red-400' : 'text-emerald-400'}`}>
                            {isRev ? '-' : '+'}৳{Math.abs(txn.amount).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {isRev ? (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-red-950 text-red-400 border border-red-800/50">
                                {language === 'bn' ? 'সংশোধিত' : 'Reversed'}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                                {language === 'bn' ? 'গৃহীত' : 'Confirmed'}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => setSelectedTxn(txn)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium"
                            >
                              {language === 'bn' ? 'রশিদ দেখুন' : 'View'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Member Profile & Nominee Information */}
      {activeTab === 'profile' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">
                {language === 'bn' ? 'সদস্য পরিচিতি ও নমিনী তথ্য' : 'Member Profile & Nominee'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'bn' ? 'আপনার ব্যক্তিগত ও মনোনীত ব্যক্তির সংরক্ষিত তথ্য' : 'Official member records & nominee contact details'}
              </p>
            </div>
            <button
              onClick={() => {
                setEditFormData({
                  phone: userProfile.phone || '',
                  permanentAddress: userProfile.permanentAddress || '',
                  currentCountry: userProfile.currentCountry || '',
                  nomineeName: userProfile.nomineeName || '',
                  nomineePhone: userProfile.nomineePhone || '',
                  nomineeRelation: userProfile.nomineeRelation || '',
                });
                setIsEditingProfile(!isEditingProfile);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isEditingProfile ? (language === 'bn' ? 'বাতিল' : 'Cancel') : (language === 'bn' ? 'তথ্য পরিবর্তন' : 'Edit Info')}</span>
            </button>
          </div>

          {isEditingProfile ? (
            <form onSubmit={handleSaveProfile} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">{language === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}</label>
                  <input
                    type="text"
                    value={editFormData.phone || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="+880 1700-000000"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">{language === 'bn' ? 'বর্তমান বসবাসের দেশ' : 'Current Country'}</label>
                  <input
                    type="text"
                    value={editFormData.currentCountry || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, currentCountry: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Bangladesh, Saudi Arabia, UAE, etc."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1">{language === 'bn' ? 'স্থায়ী ঠিকানা' : 'Permanent Address'}</label>
                  <textarea
                    rows={2}
                    value={editFormData.permanentAddress || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, permanentAddress: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="গ্রাম/রোড, ডাকঘর, থানা, জেলা"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">{language === 'bn' ? 'নমিনীর নাম' : 'Nominee Name'}</label>
                  <input
                    type="text"
                    value={editFormData.nomineeName || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, nomineeName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="সম্পূর্ণ নাম"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">{language === 'bn' ? 'সম্পর্ক' : 'Relation'}</label>
                  <input
                    type="text"
                    value={editFormData.nomineeRelation || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, nomineeRelation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="স্ত্রী / স্বামী / পিতা / মাতা / সন্তান"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">{language === 'bn' ? 'নমিনীর মোবাইল' : 'Nominee Mobile'}</label>
                  <input
                    type="text"
                    value={editFormData.nomineePhone || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, nomineePhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="+880 1700-000000"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow"
                >
                  {language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Member Personal Details Card */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <User className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-bold text-white text-sm">
                    {language === 'bn' ? 'সদস্যের তথ্য' : 'Member Details'}
                  </h4>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">{language === 'bn' ? 'সদস্য আইডি' : 'Member ID'}</span>
                  <span className="font-mono font-bold text-emerald-400">{userProfile.memberId}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">{language === 'bn' ? 'ইমেইল' : 'Email'}</span>
                  <span className="text-slate-200">{userProfile.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">{language === 'bn' ? 'মোবাইল' : 'Mobile'}</span>
                  <span className="text-slate-200">{userProfile.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">{language === 'bn' ? 'স্থায়ী ঠিকানা' : 'Address'}</span>
                  <span className="text-slate-200 text-right max-w-[200px]">{userProfile.permanentAddress || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">{language === 'bn' ? 'বসবাসের দেশ' : 'Country'}</span>
                  <span className="text-slate-200">{userProfile.currentCountry || 'Bangladesh'}</span>
                </div>
              </div>

              {/* Nominee Details Card */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <Heart className="w-4 h-4 text-rose-400" />
                  <h4 className="font-bold text-white text-sm">
                    {language === 'bn' ? 'মনোনীত ব্যক্তি (নমিনী)' : 'Nominee Details'}
                  </h4>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">{language === 'bn' ? 'নমিনীর নাম' : 'Nominee Name'}</span>
                  <span className="font-bold text-white">{userProfile.nomineeName || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">{language === 'bn' ? 'সম্পর্ক' : 'Relationship'}</span>
                  <span className="text-slate-200">{userProfile.nomineeRelation || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">{language === 'bn' ? 'নমিনীর মোবাইল' : 'Nominee Mobile'}</span>
                  <span className="text-slate-200">{userProfile.nomineePhone || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">{language === 'bn' ? 'সদস্যপদ স্ট্যাটাস' : 'Status'}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30 uppercase">
                    {userProfile.status}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Official Receipt Modal */}
      {selectedTxn && config && (
        <ReceiptModal
          transaction={selectedTxn}
          config={config}
          language={language}
          onClose={() => setSelectedTxn(null)}
        />
      )}

      {/* Official Statement Modal */}
      {showStatement && config && (
        <StatementModal
          member={userProfile}
          transactions={transactions}
          config={config}
          language={language}
          onClose={() => setShowStatement(false)}
        />
      )}
    </div>
  );
};
