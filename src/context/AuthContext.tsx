import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { UserProfile, UserRole } from '../types';
import { getUserProfile, bootstrapSystemIfNeeded, saveUserProfile } from '../services/societyService';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  role: UserRole;
  loading: boolean;
  language: 'bn' | 'en';
  setLanguage: (lang: 'bn' | 'en') => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => Promise<void>;
  refreshProfile: () => Promise<void>;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [language, setLanguage] = useState<'bn' | 'en'>('bn'); // default Bengali for Bangladesh savings society
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  const fetchProfile = async (user: FirebaseUser) => {
    try {
      const profile = await bootstrapSystemIfNeeded({
        uid: user.uid,
        email: user.email || 'user@shopnerchura.org',
        displayName: user.displayName || 'Member User',
      });
      setUserProfile(profile);
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchProfile(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      await fetchProfile(res.user);
    } catch (err) {
      console.error('Google sign in error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      await fetchProfile(res.user);
    } catch (err) {
      console.error('Email sign in error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      const newProfile: UserProfile = {
        uid: res.user.uid,
        email: res.user.email || email,
        displayName: name,
        role: 'member',
        memberId: `SC-${Math.floor(100 + Math.random() * 900)}`,
        phone: '+880 1700-000000',
        permanentAddress: 'Dhaka, Bangladesh',
        currentCountry: 'Bangladesh',
        membershipStartDate: new Date().toISOString().split('T')[0],
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await saveUserProfile(newProfile);
      setUserProfile(newProfile);
    } catch (err) {
      console.error('Email register error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUserProfile(null);
      setCurrentUser(null);
      setIsDemoMode(false);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Allows switching persona for rapid testing of Super Admin, Entry Operator, and Member UX
  const switchDemoRole = async (targetRole: UserRole) => {
    if (userProfile) {
      const updated: UserProfile = {
        ...userProfile,
        role: targetRole,
      };
      setUserProfile(updated);
      setIsDemoMode(true);
      // Persist to Firestore if authenticated
      try {
        await saveUserProfile(updated);
      } catch (e) {
        console.warn('Demo switch update local only', e);
      }
    } else {
      // Create guest demo persona
      const demoUids: Record<UserRole, { uid: string; name: string; memberId: string; email: string }> = {
        super_admin: { uid: 'demo-admin-uid', name: 'Al-Amin Rahman (Super Admin)', memberId: 'SC-ADM-001', email: 'admin@shopnerchura.org' },
        entry_operator: { uid: 'demo-operator-uid', name: 'Tanvir Hossain (Entry Operator)', memberId: 'SC-OPR-012', email: 'operator@shopnerchura.org' },
        member: { uid: 'demo-member-uid', name: 'Md. Rafiqul Islam (Member)', memberId: 'SC-2024-104', email: 'rafiqul@example.com' },
      };
      const info = demoUids[targetRole];
      setUserProfile({
        uid: info.uid,
        email: info.email,
        displayName: info.name,
        role: targetRole,
        memberId: info.memberId,
        phone: '+880 1819-876543',
        permanentAddress: 'Village: Joypur, P.O: Boro Bazar, Sylhet',
        currentCountry: 'Bangladesh',
        nomineeName: 'Nasrin Sultana (Wife)',
        nomineePhone: '+880 1711-223344',
        nomineeRelation: 'Spouse',
        membershipStartDate: '2024-01-15',
        status: 'active',
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: new Date().toISOString(),
      });
      setIsDemoMode(true);
    }
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await fetchProfile(currentUser);
    }
  };

  const activeRole: UserRole = userProfile?.role || 'member';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        role: activeRole,
        loading,
        language,
        setLanguage,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
        switchDemoRole,
        refreshProfile,
        isDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
