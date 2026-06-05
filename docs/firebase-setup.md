# Firebase Setup Guide — THS-THM Management System

## Overview

This project uses Firebase in two distinct ways:

| Layer | SDK | Purpose | Config File |
|-------|-----|---------|-------------|
| **Backend** (`apps/api`) | Firebase Admin SDK | Send FCM push notifications, verify tokens | Service account JSON |
| **Mobile** (`apps/mobile`) | Firebase Client SDK + `@react-native-firebase` | Get FCM device tokens, receive push notifications | `google-services.json` (Android), `GoogleService-Info.plist` (iOS) |

---

## 1. Backend — Firebase Admin SDK (Done ✅)

The Admin SDK service account key is already available at:

```
docs/ayo-lapor-56443-firebase-adminsdk-fbsvc-eb6564edb9.json
```

### Configuration Options

Set one of these environment variables in `apps/api/.env`:

**Option A — File path (recommended for local dev):**

```env
FIREBASE_SERVICE_ACCOUNT_PATH=../../docs/ayo-lapor-56443-firebase-adminsdk-fbsvc-eb6564edb9.json
FIREBASE_PROJECT_ID=ayo-lapor-56443
```

> ⚠️ The path is relative to `apps/api/`. The `../../docs/ayo-lapor-56443-firebase-adminsdk-fbsvc-eb6564edb9.json` path works from the api directory.

**Option B — Inline JSON (recommended for production / CI):**

```env
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"ayo-lapor-56443",...}
```

**Option C — Application Default Credentials (Cloud Run, GCE, etc.):**

```env
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
FIREBASE_PROJECT_ID=ayo-lapor-56443
```

> If none of these are set, the Firebase service starts in **dry-run mode** — it logs all push notifications without actually sending them.

---

## 2. Mobile — Android Setup (`google-services.json`)

### Step 1: Add Android app in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/project/ayo-lapor-56443/overview)
2. Click **Add app** → **Android**
3. Package name: **`com.thsthm.mobile`** (must match `app.json`)
4. App nickname: `THS-THM Mobile (Android)`
5. Click **Register app**

### Step 2: Download `google-services.json`

1. Click **Download google-services.json**
2. Save it to: **`apps/mobile/google-services.json`**

### Step 3: Verify file structure

The file should look like this (values will differ — download from console):

```json
{
  "project_info": {
    "project_number": "172370970635",
    "project_id": "ayo-lapor-56443",
    "storage_bucket": "ayo-lapor-56443.firebasestorage.app"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "1:172370970635:android:xxxxxxxxxxxxxxxx",
        "android_client_info": {
          "package_name": "com.thsthm.mobile"
        }
      },
      "api_key": [
        {
          "current_key": "AIzaSyAfn-sVxi6jjz8tS6Lzmjak9FWNo8oQ7ek"
        }
      ]
    }
  ]
}
```

### Step 4: Build with native modules

Since `@react-native-firebase/app` requires native code, you need a development build:

```bash
# Install expo-dev-client if not already installed
npx expo install expo-dev-client

# Rebuild the dev client
npx expo run:android
```

> **Expo Go is NOT supported** for `@react-native-firebase/messaging`. You must use EAS Build or a local dev build.

---

## 3. Mobile — iOS Setup (`GoogleService-Info.plist`)

### Step 1: Add iOS app in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/project/ayo-lapor-56443/overview)
2. Click **Add app** → **iOS**
3. Bundle ID: **`com.thsthm.mobile`** (must match `app.json`)
4. App nickname: `THS-THM Mobile (iOS)`
5. App Store ID: *(leave blank for now)*
6. Click **Register app**

### Step 2: Download `GoogleService-Info.plist`

1. Click **Download GoogleService-Info.plist**
2. Save it to: **`apps/mobile/GoogleService-Info.plist`**

### Step 3: Build with native modules

```bash
npx expo run:ios
```

---

## 4. Data Flow Architecture

```
                        ┌──────────────────────┐
                        │   Firebase Console    │
                        │  (ayo-lapor-56443)    │
                        └──────┬───────────┬────┘
                               │           │
              Client SDK       │           │  Admin SDK
              (FCM token)      │           │  (send push)
                               ▼           ▼
 ┌────────────────────┐              ┌──────────────────────┐
 │  Mobile App        │              │  Backend API         │
 │  (React Native)    │◄─────────────│  (NestJS)            │
 │                    │  FCM Push    │                      │
 │  • Get FCM token   │              │  • sendOtp → silent  │
 │  • Register via    │              │    push to device    │
 │    POST /auth/     │              │  • sendNotification  │
 │    register-fcm-   │              │    → visible push    │
 │    token           │              │                      │
 │  • Unregister on   │              │  • Stale token       │
 │    logout          │              │    auto-cleanup      │
 └────────────────────┘              └──────────────────────┘
```

---

## 5. Verification Checklist

- [ ] `apps/mobile/google-services.json` exists (Android)
- [ ] `apps/mobile/GoogleService-Info.plist` exists (iOS)
- [ ] `apps/api/.env` has `FIREBASE_SERVICE_ACCOUNT_PATH` or equivalent set
- [ ] `apps/mobile/.env` has `EXPO_PUBLIC_API_URL` pointing to the backend
- [ ] `expo-dev-client` installed for native builds
- [ ] FCM token registers on login (check backend logs)
- [ ] Admin sends notification → device receives push

---

## 6. Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| `TOKEN_REGISTRATION_FAILED` | `google-services.json` missing or wrong package name | Verify file exists at `apps/mobile/google-services.json` and package matches `com.thsthm.mobile` |
| `FCM push failed: messaging/registration-token-not-registered` | Stale FCM token | Backend auto-cleans stale tokens on error |
| `[DRY-RUN]` in logs | Firebase Admin SDK not configured | Set `FIREBASE_SERVICE_ACCOUNT_PATH` or `FIREBASE_SERVICE_ACCOUNT_JSON` |
| Expo Go crashes on launch | `@react-native-firebase` requires native modules | Use `npx expo run:android` or EAS Build |
