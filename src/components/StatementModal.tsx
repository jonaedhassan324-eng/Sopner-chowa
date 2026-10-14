import React from 'react';
import { UserProfile, Transaction, SocietyConfig } from '../types';
import {
  X,
  Printer,
  Download,
  Calendar,
  CreditCard,
  Building2,
  CheckCircle2,
  Shield,
  FileSpreadsheet,
} from 'lucide-react';

interface StatementModalProps {
  member: UserProfile;
  transactions: Transaction[];
  config: SocietyConfig;
  language: 'bn' | 'en';
  onClose: () => void;
}

export const StatementModal: React.FC<StatementModalProps> = ({
  member,
  transactions,
  config,
  language,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const confirmedTxns = transactions.filter((t) => t.status === 'confirmed' && !t.isReversal);
  const totalDeposited = confirmedTxns.reduce((sum, t) => sum + t.amount, 0);
  const reversalTotal = transactions
    .filter((t) => t.isReversal)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const netSavingsBalance = totalDeposited - reversalTotal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-950/70 no-print">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-300">
              {language === 'bn' ? 'সদস্যের সঞ্চয় হিসাব বিবরণী (Statement)' : 'Member Savings Statement'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'প্রিন্ট / সেভ PDF' : 'Print / Save PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Statement Document Container */}
        <div className="p-6 sm:p-8 overflow-y-auto print-container bg-slate-900 text-slate-100">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <h2 className="text-xl font-black text-white">{config.societyNameBn}</h2>
              <p className="text-xs text-emerald-400 font-bold uppercase">{config.societyNameEn}</p>
              <p className="text-[11px] text-slate-400 mt-1">{config.address}</p>
              <p className="text-[11px] text-slate-400">{config.contactNumber} • {config.email}</p>
            </div>
            <div className="text-left sm:text-right bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 w-full sm:w-auto">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                {language === 'bn' ? 'বিবরণীর ধরণ' : 'Statement Type'}
              </span>
              <p className="text-sm font-bold text-white">
                {language === 'bn' ? 'ত্রৈমাসিক সঞ্চয় পাসবুক' : 'Quarterly Savings Passbook'}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {language === 'bn' ? 'তারিখ: ' : 'Generated: '} {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Member Profile Snapshot */}
          <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between sm:justify-start sm:gap-4">
                <span className="text-slate-400">{language === 'bn' ? 'সদস্যের নাম:' : 'Member Name:'}</span>
                <span className="font-bold text-white">{member.displayName}</span>
              </div>
              <div className="flex justify-between sm:justify-start sm:gap-4">
                <span className="text-slate-400">{language === 'bn' ? 'সদস্য আইডি:' : 'Member ID:'}</span>
                <span className="font-mono font-bold text-emerald-400">{member.memberId}</span>
              </div>
              <div className="flex justify-between sm:justify-start sm:gap-4">
                <span className="text-slate-400">{language === 'bn' ? 'মোবাইল নম্বর:' : 'Mobile Phone:'}</span>
                <span className="text-slate-200">{member.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between sm:justify-start sm:gap-4">
                <span className="text-slate-400">{language === 'bn' ? 'বর্তমান দেশ:' : 'Country:'}</span>
                <span className="text-slate-200">{member.currentCountry || 'Bangladesh'}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between sm:justify-start sm:gap-4">
                <span className="text-slate-400">{language === 'bn' ? 'স্থায়ী ঠিকানা:' : 'Address:'}</span>
                <span className="text-slate-200">{member.permanentAddress || 'N/A'}</span>
              </div>
              <div className="flex justify-between sm:justify-start sm:gap-4">
                <span className="text-slate-400">{language === 'bn' ? 'নমিনীর নাম:' : 'Nominee:'}</span>
                <span className="text-slate-200">{member.nomineeName || 'N/A'} {member.nomineeRelation ? `(${member.nomineeRelation})` : ''}</span>
              </div>
              <div className="flex justify-between sm:justify-start sm:gap-4">
                <span className="text-slate-400">{language === 'bn' ? 'সদস্যপদ শুরু:' : 'Member Since:'}</span>
                <span className="text-slate-200">{member.membershipStartDate}</span>
              </div>
              <div className="flex justify-between sm:justify-start sm:gap-4">
                <span className="text-slate-400">{language === 'bn' ? 'হিসাবের অবস্থা:' : 'Status:'}</span>
                <span className="font-semibold text-emerald-400 uppercase">{member.status}</span>
              </div>
            </div>
          </div>

          {/* Balance Summary Header Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                {language === 'bn' ? 'প্রারম্ভিক স্থিতি' : 'Opening Balance'}
              </span>
              <p className="text-lg font-bold text-slate-300">৳0.00</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                {language === 'bn' ? 'মোট জমাকৃত সঞ্চয়' : 'Total Deposits'}
              </span>
              <p className="text-lg font-bold text-emerald-400">৳{totalDeposited.toLocaleString()}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/70 to-teal-950/70 border border-emerald-500/30">
              <span className="text-[10px] text-emerald-300 uppercase font-semibold">
                {language === 'bn' ? 'বর্তমান মোট সঞ্চয় স্থিতি' : 'Net Closing Balance'}
              </span>
              <p className="text-xl font-black text-white">৳{netSavingsBalance.toLocaleString()}</p>
            </div>
          </div>

          {/* Transactions Ledger Table */}
          <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950/40">
            <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {language === 'bn' ? 'জমা লেনদেনের হিসাব খতিয়ান' : 'Deposit Transactions Ledger'}
              </h3>
              <span className="text-[11px] text-slate-400">
                {transactions.length} {language === 'bn' ? 'টি লেনদেন' : 'Entries'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 bg-slate-950/60">
                    <th className="py-2.5 px-3">SL</th>
                    <th className="py-2.5 px-3">{language === 'bn' ? 'তারিখ' : 'Date'}</th>
                    <th className="py-2.5 px-3">{language === 'bn' ? 'ট্রানজেকশন আইডি' : 'Txn ID'}</th>
                    <th className="py-2.5 px-3">{language === 'bn' ? 'ত্রৈমাসিক' : 'Quarter'}</th>
                    <th className="py-2.5 px-3">{language === 'bn' ? 'মাধ্যম' : 'Method'}</th>
                    <th className="py-2.5 px-3 text-right">{language === 'bn' ? 'জমা পরিমাণ' : 'Amount'}</th>
                    <th className="py-2.5 px-3 text-center">{language === 'bn' ? 'অবস্থা' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                        {language === 'bn' ? 'এখনো কোনো সঞ্চয় লেনদেন রেকর্ড করা হয়নি।' : 'No savings transactions recorded yet.'}
                      </td>
                    </tr>
                  ) : (
                    transactions.map((txn, index) => {
                      const isRev = txn.status === 'reversed' || txn.isReversal;
                      return (
                        <tr key={txn.id || txn.transactionId} className="hover:bg-slate-900/60 transition-colors">
                          <td className="py-2.5 px-3 text-slate-400">{index + 1}</td>
                          <td className="py-2.5 px-3 font-medium text-slate-200">{txn.depositDate}</td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-emerald-400">{txn.transactionId}</td>
                          <td className="py-2.5 px-3 text-slate-300 font-semibold">{txn.quarter}</td>
                          <td className="py-2.5 px-3 text-slate-300 uppercase text-[10px]">{txn.paymentMethod}</td>
                          <td className={`py-2.5 px-3 text-right font-bold ${isRev ? 'text-red-400' : 'text-emerald-400'}`}>
                            {isRev ? '-' : '+'}৳{Math.abs(txn.amount).toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {isRev ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-950 text-red-400 border border-red-800/50">
                                {language === 'bn' ? 'সংশোধিত' : 'Reversed'}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                                {language === 'bn' ? 'গৃহীত' : 'Confirmed'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer & Audit Signatures */}
          <div className="mt-10 pt-6 border-t border-dashed border-slate-800 flex justify-between items-end text-xs text-slate-400">
            <div className="text-center">
              <div className="w-28 border-b border-slate-700 pb-1 mb-1 font-mono text-[10px]">
                {member.displayName}
              </div>
              <span>{language === 'bn' ? 'সদস্যের স্বাক্ষর' : 'Member Signature'}</span>
            </div>
            <div className="text-center">
              <div className="w-32 border-b border-slate-700 pb-1 mb-1 font-mono text-[10px] text-emerald-400">
                Shopner Chura Accounts
              </div>
              <span>{language === 'bn' ? 'অনুমোদিত হিসাবরক্ষক' : 'Authorized Auditor'}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
