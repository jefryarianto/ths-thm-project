# Android Dev Build & FCM E2E Verification Guide

## 📱 THS-THM — End-to-End FCM Push Testing

This guide walks through building the Android development client and verifying Firebase Cloud Messaging (FCM) push notifications end-to-end: from the NestJS backend through Firebase to the mobile device.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Quick Start (Script)](#2-quick-start-script)
3. [Manual Step-by-Step](#3-manual-step-by-step)
   - [3.1 Infrastructure](#31-start-infrastructure)
   - [3.2 Backend Setup](#32-backend-setup)
   - [3.3 Backend FCM Verification](#33-backend-fcm-verification)
   - [3.4 Android Dev Build](#34-android-dev-build)
   - [3.5 Mobile App Verification](#35-mobile-app-verification)
4. [E2E FCM Test Scenarios](#4-e2e-fcm-test-scenarios)
5. [Monitoring & Debugging](#5-monitoring--debugging)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Prerequisites

| Requirement | Version | Check Command |
|------------|---------|---------------|
| Node.js | ≥ 22.0.0 | `node --version` |
| pnpm | ≥ 10.0.0 | `pnpm --version` |
| Docker & Docker Compose | Latest | `docker --version && docker compose version` |
| Java (for Android build) | ≥ 17 | `java --version` |
| Android Studio / Android SDK | Latest | `echo $ANDROID_HOME` |
| Physical Android device or emulator | API 31+ (Android 12) | — |
| USB debugging enabled | — | `adb devices` |
| Google Play Services on device | Latest | Settings → About → Google Play Services |
| Firebase project | `ayo-lapor-56443` | Already configured ✅ |

> **Windows users:** Run all commands in **Git Bash** (recommended) or WSL. PowerShell with `;` as separator also works.

---

## 2. Quick Start (Script)

> ⚠️ **Important:** Before starting, make sure you've run `pnpm approve-builds` once (one-time interactive setup).

Run the automated verification script to test the backend FCM setup:

```bash
# From project root
bash scripts/verify-fcm-backend.sh
```

This script will:
1. Check Docker containers are running
2. Verify Prisma migrations are applied
3. Test the login endpoint
4. Simulate FCM token registration
5. Test OTP delivery via FCM
6. Send a test notification via the API

---

## 3. Manual Step-by-Step

### 3.1 Start Infrastructure

Start PostgreSQL, Valkey (Redis-compatible cache), and MinIO (S3-compatible storage):

```bash
# From project root
docker compose -f infra/docker/docker-compose.yml up -d postgres valkey minio

# Wait for services to be healthy (10-15 seconds)
docker compose -f infra/docker/docker-compose.yml ps
```

Expected output shows `healthy` for all three services:
```
      Name                     Command               State          Ports
──────────────────────────────────────────────────────────────────────────────
ths-thm-minio      /usr/bin/docker-entrypoint ...   Up (healthy)   0.0.0.0:9000->9000/tcp
ths-thm-postgres   docker-entrypoint.sh postgres    Up (healthy)   0.0.0.0:5432->5432/tcp
ths-thm-valkey     docker-entrypoint.sh valkey ...  Up (healthy)   0.0.0.0:6379->6379/tcp
```

### 3.2 Backend Setup

#### Install dependencies & approve build scripts

```bash
pnpm install
# If prompted about build scripts, you may need:
# pnpm approve-builds
```

#### Apply database migrations

```bash
pnpm db:migrate
```

#### Seed sample data

```bash
pnpm db:seed
```

Sample accounts created:
| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Pelatih | `pelatih1` | `pelatih123` |
| Anggota | `anggota1` | `anggota123` |

#### Configure Firebase Admin SDK

The backend needs Firebase Admin SDK credentials to send push notifications.

**Option A — File path (recommended for local dev):**

Ensure `apps/api/.env` has:
```env
FIREBASE_SERVICE_ACCOUNT_PATH=../../docs/ayo-lapor-56443-firebase-adminsdk-fbsvc-eb6564edb9.json
```

**Option B — Inline JSON (already configured):**

If `.env` already has `FIREBASE_SERVICE_ACCOUNT_JSON`, the Admin SDK will use that directly.

> **Dry-run mode:** If neither is configured, the backend starts in dry-run mode — notifications are logged to the console but NOT actually sent via FCM. This is useful for development without a real device.

#### Start the backend API

```bash
# Terminal 1: Start API with verbose logging
pnpm dev:api
```

Watch for this log line confirming Firebase is active:
```
[FirebaseService] Firebase Admin SDK initialized via service account file
```

Or if in dry-run mode:
```
[FirebaseService] Firebase Admin SDK not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON...
```

> The API starts at `http://localhost:4000`. Swagger docs at `http://localhost:4000/api/docs`.

---

### 3.3 Backend FCM Verification

Before building the mobile app, verify the backend integration is correct:

#### Test 1: Health check
```bash
curl -s http://localhost:4000/api/docs-json 2>/dev/null | head -c 200
```

#### Test 2: Login and get token
```bash
LOGIN_RESP=$(curl -s -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin","password":"admin123"}')
echo "$LOGIN_RESP" | head -c 300
```

#### Test 3: Verify send-otp endpoint (hits FCM if token exists)
```bash
curl -s -X POST http://localhost:4000/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin"}'
```

Expected response:
```json
{"message":"OTP sent successfully"}
```

Check the API terminal logs — if Firebase is configured, you'll see:
```
[NotificationsService] FCM push sent: projects/ayo-lapor-56443/messages/...
```

If no FCM token is registered for the user, you'll see:
```
[NotificationsService] User 1 (admin) has no FCM token — cannot send OTP push
```

#### Test 4: Verify send-otp fallback (OTP logged to console)
Even without FCM, the OTP is logged to the API console:
```
[AuthService] OTP for user 1 (no FCM token): 482916
```

➡ **If all tests pass, the backend FCM pipeline is working.** Now build the mobile app.

---

### 3.4 Android Dev Build

Since `@react-native-firebase/messaging` requires native code, you need a **development build** — Expo Go is NOT supported.

#### Step 1: Install expo-dev-client (if not already)

```bash
cd apps/mobile
npx expo install expo-dev-client
cd ../..
```

#### Step 2: Clear previous builds

```bash
cd apps/mobile
npx expo prebuild --clean
cd ../..
```

> This generates `android/` and `ios/` directories with native projects.

#### Step 3: Verify Google Services file

```bash
ls -la apps/mobile/google-services.json
```

Expected: file exists and is valid JSON. The file should contain `package_name: "com.thsthm.mobile"`.

If missing, copy from the docs backup:
```bash
cp docs/google-services.json apps/mobile/google-services.json
```

#### Step 4: Build & run the Android dev client

**On a physical device (recommended):**

```bash
cd apps/mobile
npx expo run:android --device
```

This will:
1. Compile the native Android app
2. Install it on your connected device (via ADB)
3. Start the Metro bundler

**On an emulator:**

First, create and start an AVD (Android Virtual Device):
```bash
# List available AVDs
emulator -list-avds

# Start an AVD
emulator -avd <avd-name>

# Then in another terminal:
cd apps/mobile
npx expo run:android
```

#### Step 5: Configure API URL for mobile

Ensure `apps/mobile/.env` has the correct backend URL:

```env
EXPO_PUBLIC_API_URL=http://<YOUR_IP>:4000/api/v1
```

> **For physical device testing:** Replace `<YOUR_IP>` with your computer's local network IP (not `localhost`). Find it with:
> - **Windows:** `ipconfig` → look for `IPv4 Address` (e.g., `192.168.1.10`)
> - **macOS/Linux:** `ifconfig` or `ip addr`

> **For emulator testing:** Use `10.0.2.2` which maps to the host machine's `localhost`:
> ```
> EXPO_PUBLIC_API_URL=http://10.0.2.2:4000/api/v1
> ```

---

### 3.5 Mobile App Verification

Once the dev build is running on your device:

#### Step 1: Login

1. Open the THS-THM app
2. Enter credentials:
   - Username: `anggota1`
   - Password: `anggota123`
3. Tap **Masuk**

#### Step 2: Verify FCM token registration

After successful login, check the API terminal for:
```
[AuthController] FCM token registered for user <id>
```

This confirms the mobile app obtained an FCM token and registered it with the backend.

#### Step 3: Trigger a push notification

From the API terminal or a new terminal, send a test notification:

```bash
# First login to get an admin token
ADMIN_RESP=$(curl -s -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin","password":"admin123"}')
ADMIN_TOKEN=$(echo "$ADMIN_RESP" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

# Get the anggota user's ID (they registered their FCM token in Step 2)
# Find the user ID — anggota1 is typically user ID 5
USER_ID=5

# Use the notifications API (this requires a special endpoint)
# For testing, we'll use the auth send-otp endpoint which triggers FCM
curl -s -X POST http://localhost:4000/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"identifier":"anggota1"}'
```

#### Step 4: Check device for push notification

If successful:
- **Android:** A notification appears in the notification drawer with the OTP code
- **API logs:** `[FirebaseService] FCM silent push sent: projects/ayo-lapor-56443/messages/...`

---

## 4. E2E FCM Test Scenarios

### Scenario 1: Login → Token Registration → Silent Push (OTP)

```
Mobile App                    Backend                     Firebase
    │                           │                           │
    │  POST /auth/login         │                           │
    │──────────────────────────►│                           │
    │                           │                           │
    │  ← accessToken + user     │                           │
    │                           │                           │
    │  Get FCM token from       │                           │
    │  @react-native-firebase   │                           │
    │  ──────────────────────►  │                           │
    │                           │                           │
    │  POST /auth/register-     │                           │
    │  fcm-token                │                           │
    │──────────────────────────►│                           │
    │                           │  Store fcmToken on User   │
    │                           │                           │
    │  POST /auth/send-otp      │                           │
    │──────────────────────────►│                           │
    │                           │  Send silent push via     │
    │                           │  Admin SDK ──────────────►│
    │  ◄── FCM push with OTP ───│──────────────────────────│
    │                           │                           │
```

### Scenario 2: Admin Creates Notification → Visible Push

```
Web Admin / API                Backend                     Firebase
    │                           │                           │
    │  POST /notifications      │                           │
    │──────────────────────────►│                           │
    │                           │  Store in DB              │
    │                           │  Send visible push via    │
    │                           │  Admin SDK ──────────────►│
    │  ◄── FCM push ────────────│──────────────────────────│
    │  (title + body visible    │                           │
    │   in notification tray)   │                           │
```

### Scenario 3: Stale Token Cleanup

```
Mobile App (uninstalled)       Backend                     Firebase
    │                           │                           │
    │  (no response)            │  Send push to old token   │
    │                           │─────────────────────────►│
    │                           │  Error: unregistered      │
    │                           │◄─────────────────────────│
    │                           │                           │
    │                           │  Clear fcmToken on User   │
    │                           │  log: "Cleared stale      │
    │                           │  FCM token for user X"    │
```

---

## 5. Monitoring & Debugging

### Backend Logs

The API logs all FCM activity at different levels:

| Log Level | Message | Meaning |
|-----------|---------|---------|
| `log` | `Firebase Admin SDK initialized...` | Firebase configured and ready |
| `log` | `FCM push sent: projects/.../messages/...` | Push successfully delivered |
| `log` | `FCM silent push sent: projects/.../messages/...` | Silent (data-only) push sent |
| `log` | `Cleared stale FCM token for user X` | Stale token cleaned up |
| `warn` | `FCM push failed for user X: ...` | Push error (non-critical) |
| `warn` | `[DRY-RUN] Push to abc12345...` | Dry-run mode (not configured) |
| `warn` | `Firebase Admin SDK not configured` | No credentials found |

View logs in real-time:
```bash
# Tail the API logs
pnpm dev:api
# or for production:
docker logs -f ths-thm-api
```

### Mobile Logs

```bash
# View React Native logs
cd apps/mobile
npx expo start

# In another terminal, view device logs
adb logcat -s ReactNative:V ReactNativeJS:V
```

Filter for FCM-specific logs:
```bash
adb logcat -s ReactNative:V | findstr "[FCM]"
```

### Firebase Console

View delivered messages in the Firebase Console:
1. Go to [Firebase Console → Ayo Lapor](https://console.firebase.google.com/project/ayo-lapor-56443/overview)
2. Navigate to **Cloud Messaging** → **Reports**
3. Check **Sent**, **Received**, and **Opened** metrics

---

## 6. Troubleshooting

### Issue: `google-services.json` not found during build

```bash
# Verify the file exists
ls -la apps/mobile/google-services.json

# If missing, copy from docs backup
cp docs/google-services.json apps/mobile/google-services.json
```

### Issue: Build fails with "package name does not match"

The `google-services.json` package name must match `app.json`:
```json
// apps/mobile/app.json → expo.android.package
"android": {
  "package": "com.thsthm.mobile"
}
```

Verify:
```bash
grep -o '"package_name":"[^"]*"' apps/mobile/google-services.json
# Expected: "package_name":"com.thsthm.mobile"
```

### Issue: FCM token not registering

Check on the device:
```bash
adb logcat -s ReactNative:V | findstr "[FCM]"
```

Common causes:
- **Expo Go** — not supported for native modules. Use `npx expo run:android`
- **No Google Play Services** — FCM requires Google Play Services on the device
- **No internet** — device must have internet to obtain an FCM token

### Issue: Push not received on device

1. **Check API logs** — Was the push sent? (`FCM push sent: ...`)
2. **Check device** — Is the app in the foreground? Android prioritizes:
   - **Foreground:** Notification comes via `onMessage()` handler in JS
   - **Background/Killed:** Notification appears in system tray automatically
3. **Check Doze mode** — Android may delay background pushes. Test with screen on.
4. **Verify token** — Is the token still valid? Try re-login.

### Issue: `messaging/registration-token-not-registered`

This means the FCM token is stale (device was reset or app reinstalled). The backend auto-cleans these:
```
[NotificationsService] Cleared stale FCM token for user X
```

Just re-login on the device to register a new token.

### Issue: `[DRY-RUN]` in logs

Firebase Admin SDK credentials are not configured. Fix by setting env vars in `apps/api/.env`:

```env
FIREBASE_SERVICE_ACCOUNT_PATH=../../docs/ayo-lapor-56443-firebase-adminsdk-fbsvc-eb6564edb9.json
```

Then restart the API.

### Issue: App crashes on launch

The app calls `@react-native-firebase/messaging` which crashes if:
- Google Play Services is missing
- Using Expo Go instead of a dev build

```bash
# Ensure you built with native modules
npx expo run:android

# For a clean rebuild
cd apps/mobile
npx expo prebuild --clean
npx expo run:android
```

### Issue: Metro bundler can't resolve `@react-native-firebase/messaging`

```bash
# Reinstall native deps
cd apps/mobile
npx expo install @react-native-firebase/app @react-native-firebase/messaging
npx expo run:android
```

---

## Appendix: Quick Commands Reference

```bash
# === Infrastructure ===
docker compose -f infra/docker/docker-compose.yml up -d postgres valkey minio

# === Backend ===
pnpm install                        # Install dependencies
pnpm db:migrate                     # Apply migrations
pnpm db:seed                        # Seed sample data
pnpm dev:api                        # Start API at :4000

# === Backend Verification ===
bash scripts/verify-fcm-backend.sh  # Automated FCM pipeline test

# === Mobile ===
cd apps/mobile
npx expo install expo-dev-client    # Ensure dev client
npx expo prebuild --clean           # Generate native projects
npx expo run:android                # Build & run on Android
cd ../..

# === Debugging ===
adb logcat -s ReactNative:V | findstr "[FCM]"
docker logs -f ths-thm-api          # API logs
```
