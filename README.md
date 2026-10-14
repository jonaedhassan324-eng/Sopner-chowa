# Shopner Chura (স্বপ্নের চূড়া) - Savings Society Mobile App & Web Platform

A comprehensive, production-grade financial platform for **Shopner Chura Savings Society (স্বপ্নের চূড়া সঞ্চয় সমিতি)**, designed for societies collecting savings contributions every three months.

---

## 🌟 Key Highlights

1. **Dual Experience**:
   - **Interactive Mobile-First Web App** with responsive Android Smartphone Preview Mode (Google Pixel / Samsung Galaxy casing with Android status bar, punch hole, and navigation bar).
   - **Native Android Project** in Kotlin & Jetpack Compose (`android/`) ready for compiling signed APKs.
2. **Backend**:
   - **Firebase Authentication** (Email/Password & Google Login).
   - **Cloud Firestore Database** (`ai-studio-5b36c217-1e95-4a08-bbd6-f30518c6b361` on project `isometric-portfolio-nv9wh`).
   - Hardened Firestore Security Rules with Attribute-Based Access Control (ABAC).
3. **Role-Based Access Control (RBAC)**:
   - **Super Admin**: Member permissions, society total balance, configuration of quarterly amounts, controlled financial reversals, and immutable audit logs.
   - **Entry Operator**: Member directory search, deposit entry with duplicate protection, instant official receipts.
   - **Member**: Personal passbook, accumulated balance in Bangladeshi Taka (৳ BDT), quarterly status (Paid, Unpaid, Partial, Overdue), and printable statement.
4. **Bilingual Support**: Full Bengali (বাংলা) & English localization toggle.
5. **No Silent Deletions**: Financial corrections strictly generate audited reversal records with mandatory explanations.

---

## 📱 Native Android Project & APK Delivery

The complete native Android project source code is in the `android/` directory:
- `android/app/build.gradle.kts`: Configured with Jetpack Compose BOM and Firebase BOM.
- `android/app/google-services.json`: Configured with the live project credentials.
- `android/app/src/main/java/com/shopnerchura/savings/`:
  - `MainActivity.kt`: Compose entry point.
  - `data/model/Models.kt`: Data entities for User, Transaction, SocietyConfig, and AuditLog.
  - `data/repository/FirebaseRepository.kt`: Cloud Firestore coroutine integration.
  - `ui/screens/`: Screens for Member, Operator, and Admin.

### Building the APK
```bash
cd android
./gradlew assembleRelease
```
See `android/README.md` for APK signing with `apksigner` and manual device sideloading steps.

---

## 🔒 Security Rules
The app uses verified Firestore security rules in `firestore.rules` enforcing:
- Member data isolation (members cannot read other members' private information).
- Only authorized operators and administrators can create financial transaction records.
- Financial transactions cannot be deleted. Corrections require audited reversals by an administrator.
- Tamper-proof audit logs.
