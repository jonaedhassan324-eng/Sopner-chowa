import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  UserProfile,
  Transaction,
  SocietyConfig,
  PaymentMethod,
} from '../types';
import {
  getAllMembers,
  getSocietyConfig,
  recordQuarterlyDeposit,
  getMemberTransactions,
  calculateMemberQuarterlyDues,
  generateTransactionId,
} from '../services/societyService';
import {
  Search,
  UserCheck,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Calendar,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Clock,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ReceiptModal } from './ReceiptModal';

export const OperatorDashboard: React.FC = () => {
  const { userProfile, role, language } = useAuth();
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<UserProfile | null>(null);
  const [memberTransactions, setMemberTransactions] = useState<Transaction[]>([]);
  const [config, setConfig] = useState<SocietyConfig | null>(null);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingTxns, setLoadingTxns] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successTxn, setSuccessTxn] = useState<Transaction | null>(null);

  // Form State
  const [amount, setAmount] = useState<number>(3000);
  const [quarter, setQuarter] = useState<string>('2026-Q1');
  const [fiscalYear, setFiscalYear] = useState<string>('2026');
  const [depositDate, setDepositDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoadingMembers(true);
    try {
      const [membersList, cfg] = await Promise.all([
        getAllMembers(),
        getSocietyConfig(),
      ]);
      setMembers(membersList);
      setConfig(cfg);
      if (cfg) {
        setAmount(cfg.quarterlyDueAmount || 3000);
        setQuarter(cfg.activeQuarter || '2026-Q1');
        setFiscalYear(cfg.currentFiscalYear || '2026');
      }
    } catch (err) {
      console.error('Failed to load operator data:', err);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleSelectMember = async (member: UserProfile) => {
    setSelectedMember(member);
    setErrorMsg(null);
    setLoadingTxns(true);
    try {
      const txns = await getMemberTransactions(member.uid);
      setMemberTransactions(txns);
    } catch (err) {
      console.error('Error fetching member transactions:', err);
    } finally {
      setLoadingTxns(false);
    }
  };

  const filteredMembers = members.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      m.displayName?.toLowerCase().includes(q) ||
      m.memberId?.toLowerCase().includes(q) ||
      m.phone?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q)
    );
  });

  const memberSavingsData = selectedMember && config
    ? calculateMemberQuarterlyDues(memberTransactions, config.quarterlyDueAmount, config.currentFiscalYear)
    : null;

  const handleSubmitDeposit = async () => {
    if (!selectedMember || !userProfile) return;
    if (amount <= 0) {
      setErrorMsg(language === 'bn' ? 'সঞ্চয়ের পরিমাণ ০ থেকে বেশি হতে হবে।' : 'Amount must be greater than 0.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const newTxn = await recordQuarterlyDeposit({
        memberUid: selectedMember.uid,
        memberId: selectedMember.memberId,
        memberName: selectedMember.displayName,
        quarter,
        fiscalYear,
        amount: Number(amount),
        depositDate,
        operatorUid: userProfile.uid,
        operatorName: userProfile.displayName,
        paymentMethod,
        paymentReference: paymentReference.trim(),
        note: note.trim(),
      });

      // Confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#14b8a6', '#f59e0b', '#3b82f6'],
        });
      } catch (e) {
        // ignore
      }

      setSuccessTxn(newTxn);
      setShowConfirmModal(false);

      // Refresh member transactions
      const updatedTxns = await getMemberTransactions(selectedMember.uid);
      setMemberTransactions(updatedTxns);

      // Reset form
      setPaymentReference('');
      setNote('');
    } catch (err: unknown) {
      console.error('Error recording deposit:', err);
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Operator Header Bar */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
            <h2 className="text-base font-bold text-white">
              {language === 'bn' ? 'ত্রৈমাসিক সঞ্চয় জমা এন্ট্রি কাউন্টার' : 'Quarterly Savings Deposit Counter'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'bn'
              ? 'সদস্য খুঁজুন এবং তাৎক্ষণিকভাবে রসিদসহ কিস্তির টাকা জমা রেকর্ড করুন'
              : 'Search member and record quarterly savings deposits with instant official receipts'}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span>
            {language === 'bn' ? 'বর্তমান ত্রৈমাসিক: ' : 'Active Quarter: '}
            <strong className="text-white">{config?.activeQuarter || '2026-Q1'}</strong>
          </span>
        </div>
      </div>

      {/* Main 2-Column Grid: Search / Select Member on Left, Record Deposit Form on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Member Directory & Search (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-emerald-400" />
                <span>{language === 'bn' ? 'সদস্য অনুসন্ধান ও নির্বাচন' : 'Find Member'}</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {filteredMembers.length} {language === 'bn' ? 'জন সদস্য' : 'members'}
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'bn' ? 'আইডি (SC-101), নাম বা ফোন লিখুন...' : 'Search by ID, name, or phone...'}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Member List */}
            <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
              {loadingMembers ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  {language === 'bn' ? 'সদস্য তালিকা লোড হচ্ছে...' : 'Loading member directory...'}
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  {language === 'bn' ? 'কোনো সদস্য পাওয়া যায়নি।' : 'No members found matching query.'}
                </div>
              ) : (
                filteredMembers.map((m) => {
                  const isSelected = selectedMember?.uid === m.uid;
                  return (
                    <button
                      key={m.uid}
                      onClick={() => handleSelectMember(m)}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between border ${
                        isSelected
                          ? 'bg-blue-950/60 border-blue-500/60 shadow-sm'
                          : 'bg-slate-950/40 border-slate-800/60 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isSelected ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {m.displayName?.slice(0, 1) || 'M'}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white leading-tight">{m.displayName}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {m.memberId} • {m.phone || m.email}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {m.status}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Selected Member Quick Passbook Status */}
          {selectedMember && memberSavingsData && (
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-white">
                  {language === 'bn' ? 'সদস্যের সঞ্চয় তথ্য' : 'Member Account Overview'}
                </span>
                <span className="font-mono text-xs font-bold text-emerald-400">
                  {selectedMember.memberId}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block">{language === 'bn' ? 'মোট সঞ্চয়' : 'Total Savings'}</span>
                  <span className="font-bold text-white text-sm">৳{memberSavingsData.totalSavingsBalance.toLocaleString()}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block">{language === 'bn' ? 'অনুমোদিত কিস্তি' : 'Installments'}</span>
                  <span className="font-bold text-emerald-400 text-sm">{memberSavingsData.confirmedCount} টি</span>
                </div>
              </div>

              {/* 4 Quarters mini-pill tracker */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  {language === 'bn' ? 'বর্তমান বছরের কিস্তিসমূহ:' : 'Current Year Dues:'}
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {memberSavingsData.quarterStatuses.map((q) => {
                    const isPaid = q.status === 'paid';
                    return (
                      <div
                        key={q.quarter}
                        className={`p-1.5 rounded-lg text-center border text-[10px] ${
                          isPaid
                            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <span className="font-mono font-bold block">{q.quarter.split('-')[1]}</span>
                        <span>{isPaid ? '✓' : '৳0'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Deposit Recording Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-400" />
                  <span>{language === 'bn' ? 'ত্রৈমাসিক সঞ্চয় জমা গ্রহণ ফর্ম' : 'Quarterly Deposit Entry Form'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {language === 'bn' ? 'যাচাইকৃত তথ্য দিয়ে কিস্তি জমা সম্পন্ন করুন' : 'Record official contribution into Cloud Firestore'}
                </p>
              </div>

              {selectedMember && (
                <div className="text-right">
                  <span className="text-xs font-bold text-white block">{selectedMember.displayName}</span>
                  <span className="text-[10px] text-emerald-400 font-mono">{selectedMember.memberId}</span>
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {!selectedMember ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <UserCheck className="w-10 h-10 text-slate-500 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">
                  {language === 'bn' ? 'বাম পাশের তালিকা থেকে একজন সদস্য নির্বাচন করুন' : 'Select a member from the left directory to begin'}
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {language === 'bn'
                    ? 'সদস্য নির্বাচনের পর জমার পরিমাণ, ত্রৈমাসিক ও পরিশোধের বিবরণ প্রদান করে রশিদ তৈরি করুন।'
                    : 'Once a member is chosen, specify deposit details and generate their official voucher receipt.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Quarter & Fiscal Year Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      {language === 'bn' ? 'সঞ্চয় কিস্তি (ত্রৈমাসিক)' : 'Quarter Cycle'}
                    </label>
                    <select
                      value={quarter}
                      onChange={(e) => {
                        setQuarter(e.target.value);
                        setFiscalYear(e.target.value.split('-')[0]);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold focus:outline-none focus:border-blue-500"
                    >
                      <option value="2026-Q1">2026 - Q1 (জানু - মার্চ / Jan - Mar)</option>
                      <option value="2026-Q2">2026 - Q2 (এপ্রিল - জুন / Apr - Jun)</option>
                      <option value="2026-Q3">2026 - Q3 (জুলাই - সেপ্টে / Jul - Sep)</option>
                      <option value="2026-Q4">2026 - Q4 (অক্টো - ডিসে / Oct - Dec)</option>
                      <option value="2025-Q4">2025 - Q4 (অক্টো - ডিসে - পূর্বের বকেয়া)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      {language === 'bn' ? 'জমার তারিখ (Deposit Date)' : 'Deposit Date'}
                    </label>
                    <input
                      type="date"
                      value={depositDate}
                      onChange={(e) => setDepositDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Amount with Quick Presets */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-slate-400 font-semibold">
                      {language === 'bn' ? 'জমার পরিমাণ (টাকা / BDT)' : 'Deposit Amount (BDT)'}
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {language === 'bn' ? `নির্ধারিত কিস্তি: ৳${config?.quarterlyDueAmount || 3000}` : `Standard: ৳${config?.quarterlyDueAmount || 3000}`}
                    </span>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-base font-bold text-emerald-400">৳</span>
                    <input
                      type="number"
                      min="1"
                      step="100"
                      value={amount || ''}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-base font-bold text-white focus:outline-none focus:border-blue-500"
                      placeholder="3000"
                    />
                  </div>

                  {/* Preset Amount Badges */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">{language === 'bn' ? 'দ্রুত বাছাই:' : 'Presets:'}</span>
                    <button
                      type="button"
                      onClick={() => setAmount(config?.quarterlyDueAmount || 3000)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                        amount === (config?.quarterlyDueAmount || 3000)
                          ? 'bg-emerald-950 border-emerald-500/50 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      ৳{config?.quarterlyDueAmount || 3000} (1 {language === 'bn' ? 'কিস্তি' : 'Quarter'})
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmount((config?.quarterlyDueAmount || 3000) * 2)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                        amount === (config?.quarterlyDueAmount || 3000) * 2
                          ? 'bg-emerald-950 border-emerald-500/50 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      ৳{(config?.quarterlyDueAmount || 3000) * 2} (2 {language === 'bn' ? 'কিস্তি' : 'Quarters'})
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmount((config?.quarterlyDueAmount || 3000) * 4)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                        amount === (config?.quarterlyDueAmount || 3000) * 4
                          ? 'bg-emerald-950 border-emerald-500/50 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      ৳{(config?.quarterlyDueAmount || 3000) * 4} (1 {language === 'bn' ? 'বছর' : 'Year'})
                    </button>
                  </div>
                </div>

                {/* Payment Method & Reference */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      {language === 'bn' ? 'পরিশোধ মাধ্যম (Payment Method)' : 'Payment Channel'}
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-blue-500"
                    >
                      <option value="cash">{language === 'bn' ? 'নগদ ক্যাশ (Cash)' : 'Cash'}</option>
                      <option value="bkash">বিকাশ (bKash MFS)</option>
                      <option value="nagad">নগদ (Nagad MFS)</option>
                      <option value="bank_transfer">{language === 'bn' ? 'ব্যাংক জমা (Bank Transfer)' : 'Bank Transfer'}</option>
                      <option value="other">{language === 'bn' ? 'অন্যান্য মাধ্যম (Other)' : 'Other'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      {language === 'bn' ? 'ভাউচার / রেফারেন্স নং' : 'Reference / TrxID (Optional)'}
                    </label>
                    <input
                      type="text"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      placeholder="MFS TrxID / Bank Slip No."
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Optional Memo / Note */}
                <div className="text-xs">
                  <label className="block text-slate-400 font-semibold mb-1">
                    {language === 'bn' ? 'মন্তব্য বা অতিরিক্ত বিবরণ (ঐচ্ছিক)' : 'Note / Memo (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={language === 'bn' ? 'যেমন: ১ম কিস্তির চূড়ান্ত জমা' : 'e.g. Regular Q1 installment received'}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Submit Action Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(true)}
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-teal-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold text-sm shadow-xl shadow-blue-950/60 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {language === 'bn'
                        ? `৳${amount.toLocaleString()} সঞ্চয় জমা রেকর্ড করুন ও রশিদ তৈরি করুন`
                        : `Record ৳${amount.toLocaleString()} Deposit & Issue Receipt`}
                    </span>
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>

      </div>

      {/* Confirmation Dialog Before Committing to Firestore */}
      {showConfirmModal && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">
                  {language === 'bn' ? 'সঞ্চয় জমা নিশ্চিতকরণ' : 'Confirm Deposit Entry'}
                </h4>
                <p className="text-xs text-slate-400">
                  {language === 'bn' ? 'অনুগ্রহ করে আর্থিক বিবরণ পুনরায় যাচাই করুন' : 'Verify financial details before recording'}
                </p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">{language === 'bn' ? 'সদস্যের নাম:' : 'Member:'}</span>
                <span className="font-bold text-white">{selectedMember.displayName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{language === 'bn' ? 'সদস্য আইডি:' : 'Member ID:'}</span>
                <span className="font-mono font-bold text-emerald-400">{selectedMember.memberId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{language === 'bn' ? 'ত্রৈমাসিক কিস্তি:' : 'Quarter:'}</span>
                <span className="font-semibold text-slate-200">{quarter}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{language === 'bn' ? 'পরিশোধ মাধ্যম:' : 'Payment Method:'}</span>
                <span className="uppercase text-slate-200">{paymentMethod}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800 text-sm">
                <span className="text-slate-300 font-bold">{language === 'bn' ? 'মোট জমার পরিমাণ:' : 'Total Amount:'}</span>
                <span className="text-emerald-400 font-black">৳{amount.toLocaleString()} BDT</span>
              </div>
            </div>

            <p className="text-[11px] text-amber-300/80 bg-amber-950/30 p-2.5 rounded-xl border border-amber-500/20">
              {language === 'bn'
                ? 'অনুমোদনের পর তাৎক্ষণিকভাবে ক্লাউড ডাটাবেজে রেকর্ড সংরক্ষিত হবে এবং অফিসিয়াল ডিজিটাল রশিদ জেনারেট হবে।'
                : 'Deposit will be logged to Firestore with immutable audit logging and instant receipt generation.'}
            </p>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSubmitDeposit}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow flex items-center justify-center gap-1.5"
              >
                {submitting ? (
                  <span>{language === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...'}</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{language === 'bn' ? 'হ্যাঁ, জমা নিশ্চিত করুন' : 'Confirm & Save'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instant Success Official Receipt Modal */}
      {successTxn && config && (
        <ReceiptModal
          transaction={successTxn}
          config={config}
          language={language}
          onClose={() => setSuccessTxn(null)}
        />
      )}
    </div>
  );
};
