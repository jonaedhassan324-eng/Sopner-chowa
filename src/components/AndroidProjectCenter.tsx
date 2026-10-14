import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Smartphone,
  Download,
  Copy,
  Check,
  Code2,
  Terminal,
  ShieldCheck,
  FileCode,
  FolderGit2,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';

export const AndroidProjectCenter: React.FC = () => {
  const { language } = useAuth();
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [activeCodeFile, setActiveCodeFile] = useState<string>('MainActivity.kt');

  const copyToClipboard = (text: string, fileKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(fileKey);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const googleServicesJson = `{
  "project_info": {
    "project_number": "10350943864",
    "project_id": "isometric-portfolio-nv9wh",
    "storage_bucket": "isometric-portfolio-nv9wh.firebasestorage.app"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "1:10350943864:android:78a3c20e104f2913db4",
        "android_client_info": {
          "package_name": "com.shopnerchura.savings"
        }
      },
      "oauth_client": [
        {
          "client_id": "10350943864-ffgi7lv43daas78btcspbor77fp6cd1a.apps.googleusercontent.com",
          "client_type": 3
        }
      ],
      "api_key": [
        {
          "current_key": "AIzaSyC7fdMb1JWofsSnXbhx118qJIB0RxogGOA"
        }
      ],
      "services": {
        "appinvite_service": {
          "other_platform_oauth_client": []
        }
      }
    }
  ],
  "configuration_version": "1"
}`;

  const gradleBuildSnippet = `// Android APK Build Commands
// 1. Ensure Android SDK (API 34) and Java 17 are installed
// 2. Navigate to the android/ directory in terminal:
cd android

// 3. Build the Release APK (or Debug APK for testing):
./gradlew assembleRelease

// The generated installable APK file will be located at:
// android/app/build/outputs/apk/release/app-release-unsigned.apk
// (or app-debug.apk if building assembleDebug)`;

  const keystoreSnippet = `// Generate Keystore for Signing the APK:
keytool -genkey -v -keystore shopner-chura-release-key.jks \\
  -keyalg RSA -keysize 2048 -validity 10000 \\
  -alias shopnerchura

// Sign the APK with jarsigner or apksigner:
apksigner sign --ks shopner-chura-release-key.jks \\
  --out ShopnerChura-v1.0.apk \\
  app/build/outputs/apk/release/app-release-unsigned.apk`;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-teal-950/70 via-slate-900 to-slate-950 p-6 rounded-3xl border border-teal-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400 shadow-lg">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                {language === 'bn' ? 'নেটিভ অ্যান্ড্রয়েড (Android) অ্যাপ ও APK ডেলিভারি' : 'Native Android APK & Jetpack Compose Suite'}
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-500/30">
                Kotlin 2.0 • Compose
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'bn'
                ? 'স্বপ্নের চূড়া সঞ্চয় সমিতির সম্পূর্ণ নেটিভ অ্যান্ড্রয়েড কোডবেস এবং রিলিজ APK তৈরির নির্দেশিকা'
                : 'Production Jetpack Compose mobile codebase connected to live Cloud Firestore and Firebase Auth'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-emerald-400 font-mono flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Firebase Configured</span>
          </span>
        </div>
      </div>

      {/* 3 Step APK Build & Install Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Step 1 */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
          <div className="w-7 h-7 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-bold font-mono">
            1
          </div>
          <h3 className="text-sm font-bold text-white">
            {language === 'bn' ? 'সোর্স কোড ও কনফিগারেশন' : 'Source Code & Firebase'}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {language === 'bn'
              ? 'রিপোজিটরির android/ ফোল্ডারে সম্পূর্ণ Jetpack Compose প্রজেক্ট জেনারেট করা আছে। google-services.json ইতিমধ্যে প্রজেক্টে সংযুক্ত।'
              : 'Complete Kotlin project structure in android/ with google-services.json wired to Cloud Firestore.'}
          </p>
        </div>

        {/* Step 2 */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
          <div className="w-7 h-7 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-bold font-mono">
            2
          </div>
          <h3 className="text-sm font-bold text-white">
            {language === 'bn' ? 'Gradle দিয়ে APK কম্পাইল' : 'Build Signed APK'}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {language === 'bn'
              ? 'অ্যান্ড্রয়েড স্টুডিও অথবা টার্মিনালে ./gradlew assembleRelease রান করে সরাসরি স্ট্যান্ডঅ্যালোন APK ফাইল তৈরি করুন।'
              : 'Run ./gradlew assembleRelease to compile the standalone APK file for offline manual distribution.'}
          </p>
        </div>

        {/* Step 3 */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
          <div className="w-7 h-7 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-bold font-mono">
            3
          </div>
          <h3 className="text-sm font-bold text-white">
            {language === 'bn' ? 'ফোনে ম্যানুয়াল ইন্সটলেশন (Sideload)' : 'Sideload onto Phone'}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {language === 'bn'
              ? 'হোয়াটসঅ্যাপ বা মেমোরি কার্ডের মাধ্যমে সদস্যদের ফোনে APK পাঠিয়ে "Install Unknown Apps" অন করে ইন্সটল করুন।'
              : 'Transfer APK via WhatsApp, Drive, or USB. Enable "Install Unknown Apps" in Android Settings and tap Install.'}
          </p>
        </div>
      </div>

      {/* Terminal & Build Script Viewer */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {language === 'bn' ? 'টার্মিনাল বিল্ড ও সাইনিং কমান্ড' : 'Gradle Build & Signing Commands'}
            </span>
          </div>
          <button
            onClick={() => copyToClipboard(gradleBuildSnippet + '\n\n' + keystoreSnippet, 'commands')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 transition-colors"
          >
            {copiedFile === 'commands' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedFile === 'commands' ? 'কপি হয়েছে' : 'Copy'}</span>
          </button>
        </div>

        <div className="p-4 bg-slate-950 font-mono text-xs text-slate-300 space-y-3 overflow-x-auto">
          <pre className="text-emerald-400 font-mono text-xs">{gradleBuildSnippet}</pre>
          <div className="pt-2 border-t border-slate-800">
            <pre className="text-amber-300 font-mono text-xs">{keystoreSnippet}</pre>
          </div>
        </div>
      </div>

      {/* google-services.json Box */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              android/app/google-services.json
            </span>
          </div>
          <button
            onClick={() => copyToClipboard(googleServicesJson, 'google-services')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 transition-colors"
          >
            {copiedFile === 'google-services' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedFile === 'google-services' ? 'কপি হয়েছে' : 'Copy JSON'}</span>
          </button>
        </div>

        <div className="p-4 bg-slate-950 font-mono text-xs text-slate-300 max-h-60 overflow-y-auto">
          <pre>{googleServicesJson}</pre>
        </div>
      </div>

      {/* Android Kotlin Code Explorer */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-bold text-white">
              {language === 'bn' ? 'অ্যান্ড্রয়েড প্রজেক্ট ফাইল এক্সপ্লোরার' : 'Android Kotlin Architecture Explorer'}
            </span>
          </div>

          <div className="flex flex-wrap gap-1">
            {[
              'MainActivity.kt',
              'Models.kt',
              'FirebaseRepository.kt',
              'MemberScreen.kt',
              'OperatorScreen.kt',
            ].map((f) => (
              <button
                key={f}
                onClick={() => setActiveCodeFile(f)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                  activeCodeFile === f
                    ? 'bg-teal-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-slate-950 font-mono text-xs text-slate-300 max-h-96 overflow-y-auto">
          {activeCodeFile === 'MainActivity.kt' && (
            <pre className="text-slate-300">
{`package com.shopnerchura.savings

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.google.firebase.auth.FirebaseAuth
import com.shopnerchura.savings.ui.theme.ShopnerChuraTheme
import com.shopnerchura.savings.ui.screens.MainAppScreen

class MainActivity : ComponentActivity() {
    private val auth by lazy { FirebaseAuth.getInstance() }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            ShopnerChuraTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    MainAppScreen(auth = auth)
                }
            }
        }
    }
}`}
            </pre>
          )}

          {activeCodeFile === 'Models.kt' && (
            <pre className="text-slate-300">
{`package com.shopnerchura.savings.data.model

data class UserProfile(
    val uid: String = "",
    val email: String = "",
    val displayName: String = "",
    val role: String = "member", // super_admin, entry_operator, member
    val memberId: String = "",
    val phone: String = "",
    val permanentAddress: String = "",
    val currentCountry: String = "Bangladesh",
    val nomineeName: String = "",
    val nomineePhone: String = "",
    val nomineeRelation: String = "",
    val membershipStartDate: String = "",
    val status: String = "active"
)

data class Transaction(
    val transactionId: String = "",
    val memberUid: String = "",
    val memberId: String = "",
    val memberName: String = "",
    val quarter: String = "2026-Q1",
    val fiscalYear: String = "2026",
    val amount: Double = 0.0,
    val depositDate: String = "",
    val entryTimestamp: String = "",
    val operatorUid: String = "",
    val operatorName: String = "",
    val paymentMethod: String = "cash",
    val status: String = "confirmed",
    val isReversal: Boolean = false,
    val reversalReason: String = ""
)

data class SocietyConfig(
    val societyNameBn: String = "স্বপ্নের চূড়া সঞ্চয় সমিতি",
    val societyNameEn: String = "Shopner Chura Savings Society",
    val quarterlyDueAmount: Double = 3000.0,
    val activeQuarter: String = "2026-Q1",
    val currentFiscalYear: String = "2026"
)`}
            </pre>
          )}

          {activeCodeFile === 'FirebaseRepository.kt' && (
            <pre className="text-slate-300">
{`package com.shopnerchura.savings.data.repository

import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ktx.toObject
import com.shopnerchura.savings.data.model.UserProfile
import com.shopnerchura.savings.data.model.Transaction
import com.shopnerchura.savings.data.model.SocietyConfig
import kotlinx.coroutines.tasks.await

class FirebaseRepository {
    private val db = FirebaseFirestore.getInstance()

    suspend fun getUserProfile(uid: String): UserProfile? {
        val snap = db.collection("users").document(uid).get().await()
        return snap.toObject<UserProfile>()
    }

    suspend fun getMemberTransactions(memberUid: String): List<Transaction> {
        val snap = db.collection("transactions")
            .whereEqualTo("memberUid", memberUid)
            .get()
            .await()
        return snap.documents.mapNotNull { it.toObject<Transaction>() }
    }

    suspend fun recordDeposit(txn: Transaction) {
        db.collection("transactions").document(txn.transactionId).set(txn).await()
    }
}`}
            </pre>
          )}

          {activeCodeFile === 'MemberScreen.kt' && (
            <pre className="text-slate-300">
{`package com.shopnerchura.savings.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun MemberSavingsScreen(
    memberId: String,
    totalBalance: Double,
    onViewStatement: () -> Unit
) {
    Column(modifier = Modifier.padding(16.dp)) {
        Card(
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
            modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp)
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Text(text = "স্বপ্নের চূড়া সঞ্চয় স্থিতি", style = MaterialTheme.typography.titleMedium)
                Text(text = "৳ $totalBalance BDT", style = MaterialTheme.typography.headlineLarge)
                Text(text = "সদস্য আইডি: $memberId", style = MaterialTheme.typography.bodySmall)
            }
        }
        Button(onClick = onViewStatement, modifier = Modifier.fillMaxWidth()) {
            Text("ডিজিটাল পাসবুক ও রশিদ বিবরণী")
        }
    }
}`}
            </pre>
          )}

          {activeCodeFile === 'OperatorScreen.kt' && (
            <pre className="text-slate-300">
{`package com.shopnerchura.savings.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun OperatorDepositScreen(
    onRecordDeposit: (memberId: String, amount: Double, quarter: String) -> Unit
) {
    var memberId by remember { mutableStateOf("") }
    var amount by remember { mutableStateOf("3000") }
    var quarter by remember { mutableStateOf("2026-Q1") }

    Column(modifier = Modifier.padding(16.dp)) {
        Text("ত্রৈমাসিক কিস্তি জমা এন্ট্রি", style = MaterialTheme.typography.titleLarge)
        Spacer(modifier = Modifier.height(12.dp))
        OutlinedTextField(
            value = memberId,
            onValueChange = { memberId = it },
            label = { Text("সদস্য আইডি (Member ID)") },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(8.dp))
        OutlinedTextField(
            value = amount,
            onValueChange = { amount = it },
            label = { Text("জমার পরিমাণ (৳ BDT)") },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(16.dp))
        Button(
            onClick = { onRecordDeposit(memberId, amount.toDoubleOrNull() ?: 0.0, quarter) },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("জমা রেকর্ড করুন ও রশিদ প্রিন্ট করুন")
        }
    }
}`}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
