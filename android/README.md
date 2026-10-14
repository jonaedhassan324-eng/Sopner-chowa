# Shopner Chura (স্বপ্নের চূড়া) - Native Android Kotlin Application

Native Android application built with **Kotlin 2.0**, **Jetpack Compose**, and **Firebase (Cloud Firestore & Authentication)** for **Shopner Chura Savings Society (স্বপ্নের চূড়া সঞ্চয় সমিতি)**.

---

## 1. Prerequisites
- **Android Studio** Hedgehog / Iguana / Jellyfish (or latest)
- **JDK 17** (Amazon Corretto, Eclipse Temurin, or Zulu)
- **Android SDK** API 34 (Android 14)

---

## 2. Firebase Configuration
The application is pre-connected to the Firebase project:
- **Project ID**: `isometric-portfolio-nv9wh`
- **Configuration File**: `android/app/google-services.json` (already present and populated with credentials).

---

## 3. How to Build the Standalone APK

### Option A: Build via Command Line (Terminal)
Navigate to the `android/` directory and run:

```bash
# On Linux / macOS:
./gradlew assembleRelease

# On Windows:
gradlew.bat assembleRelease
```

The compiled release APK will be generated at:
`android/app/build/outputs/apk/release/app-release-unsigned.apk`

---

## 4. Signing the Release APK

For production distribution without Google Play Store (manual sideloading):

1. Generate a secure Keystore:
```bash
keytool -genkey -v -keystore shopner-chura-release-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias shopnerchura
```

2. Sign and align the APK:
```bash
apksigner sign --ks shopner-chura-release-key.jks \
  --out ShopnerChura-v1.0.apk \
  app/build/outputs/apk/release/app-release-unsigned.apk
```

---

## 5. Manual Installation (Sideloading) on Android Phones

1. Send the `ShopnerChura-v1.0.apk` file to the member/operator via WhatsApp, Google Drive, or USB.
2. On the Android device, tap the file to open.
3. If prompted: **"For your security, your phone is not allowed to install unknown apps from this source"**:
   - Tap **Settings**.
   - Toggle **Allow from this source** ON.
   - Return and tap **Install**.
4. The app will launch with full access to the shared Cloud Firestore database.

---

## 6. Architecture & User Roles

- **Super Admin**: Full control over member permissions, parameters, reports, and auditable transaction reversals.
- **Entry Operator**: Member directory search, recording quarterly deposits with duplicate prevention, instant digital receipts.
- **Member**: Personal passbook view, accumulated balance in BDT (৳), quarterly dues status, and PDF statement generation.
