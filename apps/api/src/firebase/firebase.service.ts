import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getMessaging, Message, MulticastMessage } from 'firebase-admin/messaging';

interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private app: App | undefined;

  onModuleInit() {
    this.initializeApp();
  }

  private initializeApp() {
    // Check if already initialized (Firebase Admin SDK throws if initialized twice)
    const existingApps = getApps();
    if (existingApps.length > 0) {
      this.app = existingApps[0];
      this.initialized = true;
      this.logger.log('Firebase Admin already initialized');
      return;
    }

    // Priority 1: Service account JSON from env var (production)
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (serviceAccountJson) {
      try {
        const serviceAccount = JSON.parse(serviceAccountJson);
        // Handle private key where \n appears as literal chars (common in .env files)
        if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
          serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }
        this.app = initializeApp({
          credential: cert(serviceAccount),
        });
        this.logger.log('Firebase Admin SDK initialized via service account JSON');
        return;
      } catch (err) {
        this.logger.warn('Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON', err);
      }
    }

    // Priority 2: Service account file path (ESM-safe — no require())
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    if (serviceAccountPath) {
      try {
        const raw = readFileSync(serviceAccountPath, 'utf-8');
        const serviceAccount = JSON.parse(raw);
        this.app = initializeApp({
          credential: cert(serviceAccount),
        });
        this.logger.log('Firebase Admin SDK initialized via service account file');
        return;
      } catch (err) {
        this.logger.warn('Failed to load service account from path', err);
      }
    }

    // Priority 3: Application Default Credentials (Cloud Run, GCE, etc.)
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_PROJECT_ID) {
      try {
        this.app = initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID,
        });
        this.logger.log('Firebase Admin SDK initialized via Application Default Credentials');
        return;
      } catch (err) {
        this.logger.warn('Failed to initialize with Application Default Credentials', err);
      }
    }

    // No Firebase config found — run in dry-run mode
    this.logger.warn(
      'Firebase Admin SDK not configured. ' +
      'Set FIREBASE_SERVICE_ACCOUNT_JSON, FIREBASE_SERVICE_ACCOUNT_PATH, ' +
      'or GOOGLE_APPLICATION_CREDENTIALS. ' +
      'Push notifications will be logged but not sent.',
    );
  }

  private get initialized(): boolean {
    return this.app !== undefined || getApps().length > 0;
  }

  private set initialized(_val: boolean) {
    // no-op; computed from this.app
  }

  /**
   * Send a push notification to a single device via FCM.
   * Returns the FCM response message ID on success, or null if Firebase is not configured.
   */
  async sendPush(token: string, payload: PushPayload): Promise<string | null> {
    if (!this.initialized) {
      this.logger.log(`[DRY-RUN] Push to ${token.substring(0, 8)}...: ${payload.title} — ${payload.body}`);
      return null;
    }

    try {
      const message: Message = {
        token,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data,
        // Android-specific config for high priority delivery
        android: {
          priority: 'high',
          notification: {
            channelId: 'default',
            priority: 'high',
          },
        },
        // APNs-specific config for iOS
        apns: {
          payload: {
            aps: {
              alert: {
                title: payload.title,
                body: payload.body,
              },
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await getMessaging().send(message);
      this.logger.log(`FCM push sent: ${response}`);
      return response;
    } catch (error) {
      this.logger.error(`FCM push failed for token ${token.substring(0, 8)}...:`, error);
      // If the token is invalid, return a special marker so callers can clean it up
      if (this.isUnregisteredError(error)) {
        return 'UNREGISTERED';
      }
      return null;
    }
  }

  /**
   * Send the same notification to multiple devices (multicast).
   * Returns an array of results, one per token.
   */
  async sendMulticast(tokens: string[], payload: PushPayload): Promise<Array<{ token: string; success: boolean; messageId?: string }>> {
    if (!this.initialized || tokens.length === 0) {
      for (const token of tokens) {
        this.logger.log(`[DRY-RUN] Push to ${token.substring(0, 8)}...: ${payload.title} — ${payload.body}`);
      }
      return tokens.map(() => ({ token: '', success: false }));
    }

    try {
      const message: MulticastMessage = {
        tokens,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data,
        android: { priority: 'high', notification: { channelId: 'default', priority: 'high' } },
        apns: { payload: { aps: { sound: 'default', badge: 1 } } },
      };

      const response = await getMessaging().sendEachForMulticast(message);
      return response.responses.map((resp, idx) => ({
        token: tokens[idx],
        success: resp.success,
        messageId: resp.messageId || undefined,
      }));
    } catch (error) {
      this.logger.error('FCM multicast failed:', error);
      return tokens.map(() => ({ token: '', success: false }));
    }
  }

  /**
   * Send a data-only message (no notification UI) — ideal for OTP delivery
   * where the app handles display. Payload MUST NOT contain sensitive personal data.
   */
  async sendSilentPush(token: string, data: Record<string, string>): Promise<string | null> {
    if (!this.initialized) {
      this.logger.log(`[DRY-RUN] Silent push to ${token.substring(0, 8)}...:`, data);
      return null;
    }

    try {
      const message: Message = {
        token,
        data, // data-only — no notification key, so app handles it in background
        android: { priority: 'high' },
      };

      const response = await getMessaging().send(message);
      this.logger.log(`FCM silent push sent: ${response}`);
      return response;
    } catch (error) {
      this.logger.error(`FCM silent push failed:`, error);
      if (this.isUnregisteredError(error)) {
        return 'UNREGISTERED';
      }
      return null;
    }
  }

  /**
   * Check if an FCM error is due to an unregistered/invalid token.
   */
  private isUnregisteredError(error: unknown): boolean {
    if (error && typeof error === 'object') {
      const err = error as { code?: string; errorInfo?: { code?: string } };
      return err.code === 'messaging/registration-token-not-registered' ||
             err.errorInfo?.code === 'messaging/registration-token-not-registered';
    }
    return false;
  }
}
