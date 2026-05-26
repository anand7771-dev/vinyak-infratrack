<h1 align="center">
  <br/>
  🏗️ MS Vinyak Construction — InfraTrack
  <br/>
</h1>

<p align="center">
  <b>A professional construction finance & project tracking app built with React Native + Expo + Firebase</b>
</p>

<p align="center">
  <a href="https://expo.dev/accounts/ananddev7771/projects/vinyak-infratrack/builds/2605d00c-1fa5-4d7d-86ba-dd254d4823e3">
    <img src="https://img.shields.io/badge/Download%20APK-Android-green?style=for-the-badge&logo=android" alt="Download APK"/>
  </a>
  <img src="https://img.shields.io/badge/React%20Native-0.81-blue?style=for-the-badge&logo=react" alt="React Native"/>
  <img src="https://img.shields.io/badge/Expo-54-black?style=for-the-badge&logo=expo" alt="Expo"/>
  <img src="https://img.shields.io/badge/Firebase-12-orange?style=for-the-badge&logo=firebase" alt="Firebase"/>
  <img src="https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript" alt="TypeScript"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Android%20%7C%20iOS-lightgrey?style=flat-square"/>
  <img src="https://img.shields.io/badge/Version-1.0.0-success?style=flat-square"/>
  <img src="https://img.shields.io/badge/License-Private-red?style=flat-square"/>
</p>

---

## 📱 Download & Install

> **Android APK** (direct install — no Play Store needed):

🔗 **[Install on Android →](https://expo.dev/accounts/ananddev7771/projects/vinyak-infratrack/builds/2605d00c-1fa5-4d7d-86ba-dd254d4823e3)**

Scan the QR code on the link above with your Android device to install instantly.

---

## ✨ Features

### 💰 Financial Management
- **Income Tracking** — Log payments received from clients per project
- **Expense Tracking** — Record vendor payments, materials, labour costs with category tagging
- **Real-time Balance** — Automatic income vs expense summary with live updates
- **Transaction History** — Full ledger with filtering, search, and date sorting

### 🏗️ Project Management
- **Project Dashboard** — Create & manage multiple construction projects
- **Status Tracking** — Active / Completed / On-Hold with colour-coded indicators
- **Location Tagging** — Track project sites by location
- **Per-project Financials** — Filter all income/expenses by project

### 📊 Reports & Analytics
- **Financial Summary Reports** — Income, expense & balance overview
- **Category-wise Expense Breakdown** — Visual bar chart by category (Labour, Materials, Equipment, etc.)
- **Monthly Summary** — Last 6 months income vs expense comparison
- **PDF Export** — Generate and share professional PDF reports
- **Print Support** — Direct print from the app

### 📁 Company Files
- **Document Management** — Upload & manage audit reports, balance sheets, contracts
- **Cloud Storage** — Files stored securely in Firebase Storage
- **Document Viewer** — View, share, and delete uploaded files

### 🔐 Security
- **Biometric Authentication** — Face ID / Fingerprint lock screen
- **Firebase Auth** — Secure email/password login
- **Role-based Access** — Admin panel for management users
- **Firestore Security Rules** — Server-side authorization

### 🔔 Notifications
- **Push Notifications** — Stay updated on project and transaction activity
- **In-app Notification Centre** — View all alerts in one place

### 🌗 UI/UX
- **Dark / Light Mode** — Toggle between themes
- **Offline-first** — Zustand state management for responsive UI
- **Pull-to-refresh** — Live data sync with Firestore listeners
- **Smooth Animations** — React Native Reanimated transitions

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | React Native 0.81 + Expo 54 |
| **Language** | TypeScript 5.9 |
| **Navigation** | Expo Router (file-based routing) |
| **Backend** | Firebase (Firestore, Auth, Storage) |
| **State Management** | Zustand |
| **UI Components** | React Native Paper + MaterialCommunityIcons |
| **Charts** | react-native-chart-kit + react-native-svg |
| **PDF Generation** | expo-print + expo-sharing |
| **Biometrics** | expo-local-authentication |
| **Notifications** | expo-notifications |
| **Image/File Picker** | expo-image-picker + expo-document-picker |
| **Fonts** | @expo-google-fonts/inter |
| **Date Handling** | date-fns |
| **Build System** | EAS Build (Expo Application Services) |

---

## 📂 Project Structure

```
VinyakApp/
├── app/
│   ├── (auth)/          # Login & authentication screens
│   ├── (tabs)/          # Main tab screens
│   │   ├── index.tsx    # Dashboard
│   │   ├── transactions.tsx
│   │   ├── projects.tsx
│   │   ├── reports.tsx
│   │   └── more.tsx
│   ├── admin/           # Admin panel
│   ├── expense/         # Add/edit expense screens
│   ├── income/          # Add/edit income screens
│   ├── project/         # Project detail screens
│   ├── files/           # Company file management
│   ├── profile.tsx      # User profile
│   └── notifications.tsx
├── services/
│   ├── firebase.ts      # Firebase config
│   ├── authService.ts   # Authentication logic
│   ├── transactionService.ts
│   ├── projectService.ts
│   ├── documentService.ts
│   └── storageService.ts
├── store/               # Zustand state stores
├── constants/           # Colors, types, enums
├── utils/               # Formatters, PDF template
├── components/          # Shared components (LockScreen)
└── assets/              # Images, icons, fonts
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- Firebase project with Firestore, Auth & Storage enabled

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/vinyak-infratrack.git
cd vinyak-infratrack

# Install dependencies
npm install

# Start development server
npm start
```

### Firebase Setup
See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for full Firebase configuration instructions.

### Build APK

```bash
# Preview APK (direct install)
eas build --profile preview --platform android

# Production AAB (Play Store)
eas build --profile production --platform android
```

---

## 🔒 Environment Variables

Create a `.env` file (not committed to git):

```
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

## 📸 Screenshots

> _Screenshots coming soon — install the APK to see the app in action!_

---

## 👤 Developer

**Anand Dev**
- GitHub: [@ananddev7771](https://github.com/ananddev7771)
- Email: ananddev4423169@gmail.com

---

## 📄 License

This project is proprietary software built for **MS Vinyak Construction**.
All rights reserved © 2026 MS Vinyak Construction.
