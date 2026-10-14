import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AndroidFrame } from './components/AndroidFrame';
import { MemberDashboard } from './components/MemberDashboard';
import { OperatorDashboard } from './components/OperatorDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AndroidProjectCenter } from './components/AndroidProjectCenter';
import { AuthModal } from './components/AuthModal';

function AppContent() {
  const { role, userProfile, isDemoMode, language } = useAuth();
  const [activeTab, setActiveTab] = useState<'member' | 'operator' | 'admin' | 'android_project'>('member');
  const [isAndroidFrame, setIsAndroidFrame] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAndroidFrame={isAndroidFrame}
        setIsAndroidFrame={setIsAndroidFrame}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Demo Notification Banner if active */}
      {isDemoMode && (
        <div className="bg-gradient-to-r from-emerald-950/80 via-teal-950/80 to-purple-950/80 border-b border-emerald-500/20 py-1.5 px-4 text-center text-xs text-emerald-300 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>
            {language === 'bn'
              ? `পরীক্ষামূলক মোড সক্রিয়: বর্তমান রোল "${role}"। উপরের মেন্যু থেকে যেকোনো মুহূর্তে রোল পরিবর্তন করতে পারেন।`
              : `Testing Mode Active: current role "${role}". You can switch personas anytime from the top bar.`}
          </span>
        </div>
      )}

      {/* Main View Area with optional Android Phone Frame */}
      <main className="flex-1 w-full">
        <AndroidFrame enabled={isAndroidFrame}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full">
            {activeTab === 'member' && <MemberDashboard />}
            {activeTab === 'operator' && <OperatorDashboard />}
            {activeTab === 'admin' && <AdminDashboard />}
            {activeTab === 'android_project' && <AndroidProjectCenter />}
          </div>
        </AndroidFrame>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-4 px-4 text-center text-xs text-slate-400 no-print">
        <p>
          © 2026 <strong>স্বপ্নের চূড়া সঞ্চয় সমিতি</strong> (Shopner Chura Savings Society). All rights reserved.
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Quarterly Savings Management • Cloud Firestore & Firebase Auth • Native Android APK Suite
        </p>
      </footer>

      {/* Authentication Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
