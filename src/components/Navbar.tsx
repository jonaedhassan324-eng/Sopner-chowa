import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Smartphone,
  Globe,
  UserCheck,
  LogOut,
  Sparkles,
  Layers,
  FileCode,
  DollarSign,
  ChevronDown,
} from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  activeTab: 'member' | 'operator' | 'admin' | 'android_project';
  setActiveTab: (tab: 'member' | 'operator' | 'admin' | 'android_project') => void;
  isAndroidFrame: boolean;
  setIsAndroidFrame: (val: boolean) => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isAndroidFrame,
  setIsAndroidFrame,
  onOpenAuth,
}) => {
  const { userProfile, role, language, setLanguage, logout, switchDemoRole, currentUser } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = React.useState(false);

  const roleBadgeConfig = {
    super_admin: {
      bg: 'bg-purple-950/80 border-purple-500/40 text-purple-300',
      labelEn: 'Super Admin',
      labelBn: 'সুপার এডমিন',
      dot: 'bg-purple-400',
    },
    entry_operator: {
      bg: 'bg-blue-950/80 border-blue-500/40 text-blue-300',
      labelEn: 'Entry Operator',
      labelBn: 'এন্ট্রি অপারেটর',
      dot: 'bg-blue-400',
    },
    member: {
      bg: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300',
      labelEn: 'Member',
      labelBn: 'সদস্য',
      dot: 'bg-emerald-400',
    },
  };

  const currentBadge = roleBadgeConfig[role] || roleBadgeConfig.member;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Society Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-950/50 border border-emerald-400/30">
              <span className="text-xl font-black text-white">চূ</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span className="text-emerald-400">স্বপ্নের চূড়া</span>
                  <span className="text-xs font-normal text-slate-400 hidden md:inline">| Shopner Chura</span>
                </h1>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {language === 'bn' ? 'সঞ্চয় সমিতি' : 'Savings'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {language === 'bn' ? 'ত্রৈমাসিক সঞ্চয় ব্যবস্থাপনা ও ডিজিটাল পাসবুক' : 'Quarterly Savings Society & Digital Passbook'}
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Desktop & Mobile header) */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('member')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'member'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {language === 'bn' ? 'আমার সঞ্চয় (সদস্য)' : 'Member Savings'}
            </button>

            {(role === 'entry_operator' || role === 'super_admin') && (
              <button
                onClick={() => setActiveTab('operator')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'operator'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {language === 'bn' ? 'জমা এন্ট্রি (অপারেটর)' : 'Record Deposit'}
              </button>
            )}

            {role === 'super_admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'admin'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {language === 'bn' ? 'এডমিন ড্যাশবোর্ড' : 'Admin Control'}
              </button>
            )}

            <button
              onClick={() => setActiveTab('android_project')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'android_project'
                  ? 'bg-teal-600 text-white shadow'
                  : 'text-teal-400 hover:text-teal-300'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'Android APK কোড' : 'Android APK Project'}</span>
            </button>
          </div>

          {/* Right Toolbar Controls */}
          <div className="flex items-center gap-2">
            {/* Android Device Frame Toggle */}
            <button
              onClick={() => setIsAndroidFrame(!isAndroidFrame)}
              title={isAndroidFrame ? 'Switch to Full Web View' : 'Preview in Android Phone Frame'}
              className={`p-2 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                isAndroidFrame
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 shadow-sm'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden xl:inline">
                {isAndroidFrame
                  ? (language === 'bn' ? 'Android ফ্রেম' : 'Android Frame')
                  : (language === 'bn' ? 'ফুল স্ক্রিন' : 'Fullscreen')}
              </span>
            </button>

            {/* Language Switch */}
            <button
              onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'bn' ? 'English' : 'বাংলা'}</span>
            </button>

            {/* Role Switcher Dropdown (Allows testing Super Admin, Operator, Member) */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${currentBadge.bg}`}
              >
                <span className={`w-2 h-2 rounded-full ${currentBadge.dot} animate-pulse`} />
                <span className="font-semibold">{language === 'bn' ? currentBadge.labelBn : currentBadge.labelEn}</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800/80">
                    {language === 'bn' ? 'রোল পরিবর্তন (টেস্টিং)' : 'Switch Role (Test Modes)'}
                  </div>
                  <button
                    onClick={() => {
                      switchDemoRole('super_admin');
                      setRoleMenuOpen(false);
                      setActiveTab('admin');
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-purple-950/40 ${
                      role === 'super_admin' ? 'text-purple-300 font-bold bg-purple-950/20' : 'text-slate-300'
                    }`}
                  >
                    <span>{language === 'bn' ? 'সুপার এডমিন (Super Admin)' : 'Super Admin'}</span>
                    {role === 'super_admin' && <span className="text-[10px] text-purple-400">✓</span>}
                  </button>
                  <button
                    onClick={() => {
                      switchDemoRole('entry_operator');
                      setRoleMenuOpen(false);
                      setActiveTab('operator');
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-blue-950/40 ${
                      role === 'entry_operator' ? 'text-blue-300 font-bold bg-blue-950/20' : 'text-slate-300'
                    }`}
                  >
                    <span>{language === 'bn' ? 'এন্ট্রি অপারেটর (Operator)' : 'Entry Operator'}</span>
                    {role === 'entry_operator' && <span className="text-[10px] text-blue-400">✓</span>}
                  </button>
                  <button
                    onClick={() => {
                      switchDemoRole('member');
                      setRoleMenuOpen(false);
                      setActiveTab('member');
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-950/40 ${
                      role === 'member' ? 'text-emerald-300 font-bold bg-emerald-950/20' : 'text-slate-300'
                    }`}
                  >
                    <span>{language === 'bn' ? 'সাধারণ সদস্য (Member)' : 'Member'}</span>
                    {role === 'member' && <span className="text-[10px] text-emerald-400">✓</span>}
                  </button>
                </div>
              )}
            </div>

            {/* User Profile or Login */}
            {userProfile || currentUser ? (
              <div className="flex items-center gap-1.5">
                <div
                  title={userProfile?.displayName || currentUser?.email || 'User'}
                  className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-emerald-400"
                >
                  {userProfile?.displayName?.slice(0, 2).toUpperCase() || 'SC'}
                </div>
                <button
                  onClick={logout}
                  title={language === 'bn' ? 'লগআউট' : 'Logout'}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1 shadow-sm"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'লগইন' : 'Login'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Subnav Strip */}
        <div className="flex lg:hidden items-center justify-around gap-1 mt-2.5 pt-2 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('member')}
            className={`flex-1 py-1.5 text-center text-xs font-medium rounded-lg ${
              activeTab === 'member' ? 'bg-emerald-600 text-white' : 'text-slate-400'
            }`}
          >
            {language === 'bn' ? 'সদস্য ড্যাশবোর্ড' : 'Member'}
          </button>
          {(role === 'entry_operator' || role === 'super_admin') && (
            <button
              onClick={() => setActiveTab('operator')}
              className={`flex-1 py-1.5 text-center text-xs font-medium rounded-lg ${
                activeTab === 'operator' ? 'bg-blue-600 text-white' : 'text-slate-400'
              }`}
            >
              {language === 'bn' ? 'জমা এন্ট্রি' : 'Operator'}
            </button>
          )}
          {role === 'super_admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex-1 py-1.5 text-center text-xs font-medium rounded-lg ${
                activeTab === 'admin' ? 'bg-purple-600 text-white' : 'text-slate-400'
              }`}
            >
              {language === 'bn' ? 'এডমিন' : 'Admin'}
            </button>
          )}
          <button
            onClick={() => setActiveTab('android_project')}
            className={`flex-1 py-1.5 text-center text-xs font-medium rounded-lg ${
              activeTab === 'android_project' ? 'bg-teal-600 text-white' : 'text-teal-400'
            }`}
          >
            {language === 'bn' ? 'APK প্রজেক্ট' : 'APK Code'}
          </button>
        </div>
      </div>
    </header>
  );
};
