# 🔥 Firebase Setup Guide — Ms Vinyak Construction App

## Step 1: Create Firebase Project

1. Go to **[firebase.google.com](https://firebase.google.com)**
2. Click **"Get Started"** → **"Add project"**
3. Project name: `vinyak-infratrack`
4. Disable Google Analytics (not needed) → **"Create project"**

---

## Step 2: Enable Authentication

1. In Firebase Console → **Authentication** → **"Get started"**
2. Click **"Email/Password"** → Toggle **Enable** → **Save**

---

## Step 3: Enable Firestore Database

1. Go to **Firestore Database** → **"Create database"**
2. Select **"Start in production mode"** → **Next**
3. Choose your region (e.g., `asia-south1` for India) → **Done**
4. Go to **Rules** tab → Paste the rules from `firestore.rules` file → **Publish**

---

## Step 4: Enable Storage

1. Go to **Storage** → **"Get started"**
2. Accept default rules → **Done**
3. Go to **Rules** tab and update to:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## Step 5: Get Your Firebase Config

1. Go to **Project Settings** (gear icon) → **General** tab
2. Scroll to **"Your apps"** → Click **"</>"** (Web App) → Register app
3. App nickname: `vinyak-app` → **Register**
4. Copy the `firebaseConfig` object

---

## Step 6: Add Config to App

Open `services/firebase.ts` and replace the placeholder:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

---

## Step 7: Test the App

```bash
cd VinyakApp
npm start
```

Then scan the QR code with **Expo Go** app on your Android phone.

---

## Step 8: Build APK (For Distribution)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build APK for Android
eas build --platform android --profile preview
```

This generates a downloadable `.apk` file you can install on any Android device.

---

## ✅ What's Included

| Feature | Status |
|---|---|
| Login / Signup / Forgot Password | ✅ |
| Dashboard with real-time stats | ✅ |
| Projects (add, view, edit status) | ✅ |
| Income Entry with receipt upload | ✅ |
| Expense Entry with bill upload | ✅ |
| Transactions Ledger with filters | ✅ |
| Reports with PDF Download | ✅ |
| Print Reports | ✅ |
| Notifications | ✅ |
| Admin Panel | ✅ |
| User Profile with photo | ✅ |
| Dark Mode | ✅ |
| Offline Support (Firestore cache) | ✅ |
| Role-based Access (Admin/Partner/Staff) | ✅ |
