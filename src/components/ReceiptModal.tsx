import React, { useRef } from 'react';
import { Transaction, SocietyConfig } from '../types';
import {
  X,
  Printer,
  Share2,
  CheckCircle2,
  Copy,
  Check,
  Building,
  Calendar,
  CreditCard,
  User,
  ShieldCheck,
  Download,
} from 'lucide-react';

interface ReceiptModalProps {
  transaction: Transaction | null;
  config: SocietyConfig;
  language: 'bn' | 'en';
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  config,
  language,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!transaction) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `Shopner Chura Savings Society Receipt\nTxn ID: ${transaction.transactionId}\nMember: ${transaction.memberName} (${transaction.memberId})\nAmount: ৳${transaction.amount.toLocaleString()}\nQuarter: ${transaction.quarter}\nDate: ${transaction.depositDate}\nStatus: Confirmed`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const paymentLabels = {
    cash: { en: 'Cash Payment', bn: 'নগদ জমা' },
    bkash: { en: 'bKash MFS', bn: 'বিকাশ (bKash)' },
    nagad: { en: 'Nagad MFS', bn: 'নগদ (Nagad)' },
    bank_transfer: { en: 'Bank Deposit', bn: 'ব্যাংক জমা' },
    other: { en: 'Other Channel', bn: 'অন্যান্য মাধ্যম' },
  };

  const isReversed = transaction.status === 'reversed' || transaction.isReversal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Top Actions */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950/70 no-print">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-300">
              {language === 'bn' ? 'অফিসিয়াল জমা রশিদ' : 'Official Deposit Receipt'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Copy Receipt text"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div ref={receiptRef} className="p-6 overflow-y-auto print-container bg-slate-900 text-slate-100">
          
          {/* Official Letterhead Header */}
          <div className="text-center pb-5 border-b border-slate-800/80 relative">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-2xl shadow-lg shadow-emerald-950/60 mb-2 border border-emerald-400/40">
              চূ
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              {config.societyNameBn}
            </h2>
            <p className="text-xs text-emerald-400 font-semibold tracking-wide uppercase">
              {config.societyNameEn}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
              {config.address} • {config.contactNumber}
            </p>
            {config.registrationNo && (
              <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/80">
                Reg: {config.registrationNo}
              </span>
            )}
          </div>

          {/* Status Ribbon & Receipt Title */}
          <div className="my-4 flex items-center justify-between bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {language === 'bn' ? 'রশিদ ক্রমিক নং' : 'Receipt Voucher No.'}
              </span>
              <p className="text-xs font-mono font-bold text-emerald-400 tracking-wider">
                {transaction.transactionId}
              </p>
            </div>
            <div className="text-right">
              {isReversed ? (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-950/80 text-red-400 border border-red-500/30">
                  {language === 'bn' ? 'সংশোধিত / বাতিল' : 'REVERSED'}
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'গৃহীত ও নিশ্চিত' : 'CONFIRMED'}</span>
                </span>
              )}
            </div>
          </div>

          {/* Amount Showcase Banner */}
          <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-teal-950/40 to-slate-950 border border-emerald-500/20 text-center">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              {language === 'bn' ? 'জমার মোট পরিমাণ' : 'Total Deposited Amount'}
            </span>
            <div className="text-3xl font-black text-white mt-1 flex items-center justify-center gap-1">
              <span className="text-emerald-400 font-bold">৳</span>
              <span>{Math.abs(transaction.amount).toLocaleString()}</span>
              <span className="text-xs font-normal text-slate-400 ml-1">BDT</span>
            </div>
            <p className="text-[11px] text-emerald-400/90 font-medium mt-1">
              {language === 'bn' ? 'ত্রৈমাসিক সঞ্চয় কিস্তি' : 'Quarterly Savings Contribution'} ({transaction.quarter})
            </p>
          </div>

          {/* Details Grid */}
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">{language === 'bn' ? 'সদস্যের নাম' : 'Member Name'}:</span>
              <span className="font-semibold text-white">{transaction.memberName}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">{language === 'bn' ? 'সদস্য নম্বর' : 'Member ID'}:</span>
              <span className="font-mono font-bold text-emerald-400">{transaction.memberId}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">{language === 'bn' ? 'সঞ্চয় কিস্তি ত্রৈমাসিক' : 'Quarter Cycle'}:</span>
              <span className="font-medium text-slate-200">{transaction.quarter} ({transaction.fiscalYear})</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">{language === 'bn' ? 'জমার তারিখ' : 'Deposit Date'}:</span>
              <span className="font-medium text-slate-200">{transaction.depositDate}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">{language === 'bn' ? 'পরিশোধ মাধ্যম' : 'Payment Method'}:</span>
              <span className="font-medium text-slate-200">
                {language === 'bn'
                  ? paymentLabels[transaction.paymentMethod]?.bn
                  : paymentLabels[transaction.paymentMethod]?.en}
              </span>
            </div>

            {transaction.paymentReference && (
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">{language === 'bn' ? 'ভাউচার / রেফারেন্স' : 'Reference / TrxID'}:</span>
                <span className="font-mono text-slate-300">{transaction.paymentReference}</span>
              </div>
            )}

            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">{language === 'bn' ? 'গ্রহীতা / অপারেটর' : 'Authorized Operator'}:</span>
              <span className="font-medium text-slate-300">
                {transaction.operatorName} ({transaction.operatorUid.slice(0, 8)})
              </span>
            </div>

            {transaction.note && (
              <div className="py-2 text-[11px] text-slate-400 italic bg-slate-950/40 p-2 rounded-lg">
                <span className="font-medium text-slate-300 not-italic">{language === 'bn' ? 'মন্তব্য: ' : 'Note: '}</span>
                {transaction.note}
              </div>
            )}

            {isReversed && transaction.reversalReason && (
              <div className="py-2 text-[11px] text-red-300 bg-red-950/40 border border-red-800/40 p-2.5 rounded-lg">
                <span className="font-bold">{language === 'bn' ? 'সংশোধনের কারণ: ' : 'Correction Reason: '}</span>
                {transaction.reversalReason}
              </div>
            )}
          </div>

          {/* Signature & Seal Footer */}
          <div className="mt-8 pt-6 border-t border-dashed border-slate-800 flex items-end justify-between">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full border border-dashed border-emerald-500/40 flex items-center justify-center p-1 text-[9px] text-emerald-400 font-mono rotate-[-12deg] select-none bg-emerald-950/20">
                <span>SHOPNER CHURA SEAL</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">{language === 'bn' ? 'ডিজিটাল সিল' : 'Digital Seal'}</p>
            </div>

            <div className="text-center">
              <div className="w-32 border-b border-slate-600 pb-1 mb-1 font-mono text-[11px] text-slate-300 italic">
                {transaction.operatorName}
              </div>
              <p className="text-[10px] text-slate-400">
                {language === 'bn' ? 'কর্তৃপক্ষের স্বাক্ষর' : 'Authorized Signature'}
              </p>
            </div>
          </div>

          <div className="mt-6 text-center text-[10px] text-slate-400">
            {language === 'bn'
              ? 'এটি একটি কম্পিউটার জেনারেটেড ডিজিটাল সঞ্চয় রশিদ। কোনো প্রশ্ন থাকলে সমিতির অফিসে যোগাযোগ করুন।'
              : 'This is a computer-generated digital savings receipt. For any queries, contact the society office.'}
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex gap-2 no-print">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-emerald-950/50"
          >
            <Printer className="w-4 h-4" />
            <span>{language === 'bn' ? 'রশিদ প্রিন্ট বা পিডিএফ' : 'Print / Save PDF'}</span>
          </button>
          <button
            onClick={handleCopy}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied') : (language === 'bn' ? 'শেয়ার' : 'Share')}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
