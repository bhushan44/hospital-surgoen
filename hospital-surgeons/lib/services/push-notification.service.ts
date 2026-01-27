/**
 * Push Notification Service
 * Handles sending FCM push notifications to mobile devices
 */

import * as admin from 'firebase-admin';
import { UserDevicesRepository } from '@/lib/repositories/user-devices.repository';

// Initialize Firebase Admin if not already initialized
let firebaseApp: admin.app.App | null = null;

function initializeFirebase(): admin.app.App | null {
  // Check if Firebase app already exists (handles hot reloading in Next.js)
  try {
    if (admin.apps.length > 0) {
      const existingApp = admin.apps[0];
      firebaseApp = existingApp;
      console.log('✅ Firebase Admin app already exists, reusing existing app');
      return existingApp;
    }
  } catch (error) {
    // If getApp fails, continue with initialization
  }

  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    // Check if Firebase credentials are provided
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountKey) {
      console.warn('⚠️  Firebase credentials not configured. Push notifications will be disabled.');
      return null;
    }

    // Parse the service account key (can be JSON string or path to file)
    let serviceAccount: admin.ServiceAccount;

    // Trim whitespace
    let trimmedKey = serviceAccountKey.trim();

    // Debug: Log first few characters to help diagnose issues
    const firstChars = trimmedKey.substring(0, 20);
    console.log(`🔍 Firebase key starts with: ${firstChars}... (length: ${trimmedKey.length})`);

    // Remove outer quotes if present (handles both single and double quotes)
    // This is common when environment variables are set with quotes
    const hadQuotes =
      (trimmedKey.startsWith('"') && trimmedKey.endsWith('"')) ||
      (trimmedKey.startsWith("'") && trimmedKey.endsWith("'"));

    if (hadQuotes) {
      trimmedKey = trimmedKey.slice(1, -1).trim();
      console.log(`🔍 Removed outer quotes. Now starts with: ${trimmedKey.substring(0, 20)}...`);
    }

    // Check if it looks like JSON (starts with {)
    const isJsonString = trimmedKey.startsWith('{');

    if (!isJsonString) {
      console.log(`⚠️  Key does not start with '{', treating as file path`);
    }

    if (isJsonString) {
      // It's a JSON string - parse it directly
      try {
        serviceAccount = JSON.parse(trimmedKey);
      } catch (parseError: any) {
        console.error('❌ Error parsing Firebase service account JSON:', parseError.message);
        console.error('First 100 chars of key:', trimmedKey.substring(0, 100));

        // Try to handle escaped JSON strings (common in environment variables)
        try {
          // Unescape common patterns
          let unescaped = trimmedKey
            .replace(/\\"/g, '"')
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\t/g, '\t')
            .replace(/\\\\/g, '\\');

          serviceAccount = JSON.parse(unescaped);
          console.log('✅ Successfully parsed after unescaping');
        } catch (secondParseError: any) {
          console.error('❌ Error parsing Firebase service account JSON (second attempt):', secondParseError.message);
          throw new Error(`Invalid Firebase service account JSON format: ${secondParseError.message}`);
        }
      }
    } else {
      // It's a file path - read from file
      try {
        const fs = require('fs');
        const path = require('path');
        const keyPath = path.resolve(trimmedKey);

        // Check if file exists
        if (!fs.existsSync(keyPath)) {
          throw new Error(`Firebase service account file not found: ${keyPath}`);
        }

        serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
      } catch (fileError: any) {
        console.error('❌ Error reading Firebase service account file:', fileError.message);
        throw new Error(`Failed to read Firebase service account from file: ${fileError.message}`);
      }
    }

    // Validate that we have required fields
    const account = serviceAccount as any;
    if (!account.project_id && !account.projectId) {
      throw new Error('Firebase service account is missing project_id');
    }
    if (!account.private_key && !account.privateKey) {
      throw new Error('Firebase service account is missing private_key');
    }
    if (!account.client_email && !account.clientEmail) {
      throw new Error('Firebase service account is missing client_email');
    }

    // Fix private key: ensure it has actual newlines (not escaped \n)
    // Firebase Admin SDK requires actual newline characters in the PEM format
    let privateKey = account.private_key || account.privateKey;
    
    if (privateKey && typeof privateKey === 'string') {
      // After JSON.parse(), \n escape sequences become actual newlines
      // But if there are literal \n (backslash + n), we need to replace them
      if (privateKey.includes('\\n')) {
        // Replace literal \n with actual newlines
        privateKey = privateKey.replace(/\\n/g, '\n');
        console.log('✅ Fixed private key newlines (replaced literal \\n)');
      }
      
      // Trim any extra whitespace
      privateKey = privateKey.trim();
      
      // Ensure private key starts and ends correctly
      if (!privateKey.startsWith('-----BEGIN')) {
        console.error('❌ Private key does not start with -----BEGIN');
        console.error('❌ First 50 chars:', privateKey.substring(0, 50));
      }
      if (!privateKey.endsWith('-----END PRIVATE KEY-----')) {
        // Check if it ends with just the END marker
        if (!privateKey.includes('-----END PRIVATE KEY-----')) {
          console.error('❌ Private key does not contain -----END PRIVATE KEY-----');
        } else {
          // Trim anything after the END marker (like extra newlines)
          const endIndex = privateKey.indexOf('-----END PRIVATE KEY-----');
          if (endIndex !== -1) {
            privateKey = privateKey.substring(0, endIndex + '-----END PRIVATE KEY-----'.length);
          }
        }
      }
      
      // Debug: Show private key structure
      const lines = privateKey.split('\n');
      console.log('🔍 Private key structure:');
      console.log(`🔍   Total lines: ${lines.length}`);
      console.log(`🔍   First line: ${lines[0]}`);
      console.log(`🔍   Last line: ${lines[lines.length - 1]}`);
      console.log(`🔍   Key starts correctly: ${privateKey.startsWith('-----BEGIN PRIVATE KEY-----')}`);
      console.log(`🔍   Key ends correctly: ${privateKey.endsWith('-----END PRIVATE KEY-----')}`);
    }

    // Normalize the service account object for Firebase Admin SDK
    // Firebase Admin SDK expects camelCase fields
    const normalizedAccount: admin.ServiceAccount = {
      projectId: account.project_id || account.projectId,
      privateKey: privateKey || account.private_key || account.privateKey,
      clientEmail: account.client_email || account.clientEmail,
    };

    console.log('🔍 Initializing Firebase Admin SDK...');
    console.log('🔍 Using project:', normalizedAccount.projectId);
    console.log('🔍 Using email:', normalizedAccount.clientEmail);
    console.log('🔍 Private key length:', normalizedAccount.privateKey?.length || 0);
    console.log('🔍 Private key has newlines:', normalizedAccount.privateKey?.includes('\n') ? 'Yes' : 'No');
    
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(normalizedAccount),
    });

    console.log('✅ Firebase Admin initialized successfully');
    return firebaseApp;
  } catch (error: any) {
    // If app already exists error, reuse existing app
    if (error.message && error.message.includes('already exists')) {
      try {
        // Use admin.app() to get the default app (handles the "already exists" case)
        const existingApp = admin.app();
        firebaseApp = existingApp;
        console.log('✅ Firebase Admin app already exists, reusing existing app');
        return existingApp;
      } catch (getAppError: any) {
        // If getApp also fails, try admin.apps array
        if (admin.apps.length > 0) {
          const existingApp = admin.apps[0];
          firebaseApp = existingApp;
          console.log('✅ Firebase Admin app already exists, reusing existing app from apps array');
          return existingApp;
        }
        console.error('❌ Error getting existing Firebase app:', getAppError.message || getAppError);
        return null;
      }
    }
    console.error('❌ Error initializing Firebase Admin:', error.message || error);
    return null;
  }
}

// Initialize on module load
initializeFirebase();

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
  sound?: string;
  badge?: number;
}

export interface SendNotificationResult {
  success: boolean;
  sentCount: number;
  error?: string;
}

/**
 * Push Notification Service
 */
export class PushNotificationService {
  private userDevicesRepository = new UserDevicesRepository();

  /**
   * Send push notification to a single user
   */
  async sendPushNotification(
    userId: string,
    payload: PushNotificationPayload
  ): Promise<SendNotificationResult> {
    console.log('📱 [PUSH NOTIFICATION] Starting push notification send');
    console.log('📱 [PUSH NOTIFICATION] User ID:', userId);
    console.log('📱 [PUSH NOTIFICATION] Title:', payload.title);
    console.log('📱 [PUSH NOTIFICATION] Body:', payload.body);

    // Ensure Firebase is initialized (check for existing app or initialize)
    const app = firebaseApp || (admin.apps.length > 0 ? admin.apps[0] : null);
    if (!app) {
      // Try to initialize if not already done
      const initializedApp = initializeFirebase();
      if (!initializedApp) {
        console.warn('⚠️  [PUSH NOTIFICATION] Firebase not initialized. Skipping push notification.');
        return { success: false, sentCount: 0, error: 'Firebase not initialized' };
      }
    }

    try {
      // Get device tokens for the user
      console.log('📱 [PUSH NOTIFICATION] Fetching active device tokens for user:', userId);
      let deviceTokens = await this.userDevicesRepository.getActiveDeviceTokens(userId);
      console.log(`📱 [PUSH NOTIFICATION] Retrieved ${deviceTokens.length} device token(s) from repository`);
      

      if (deviceTokens.length === 0) {
        console.log(`📱 [PUSH NOTIFICATION] No active device tokens found for user ${userId}`);
        // For testing: use a fake token to test FCM sending logic
        const fakeToken = `test-token-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        deviceTokens = [fakeToken];
        console.log(`🧪 [PUSH NOTIFICATION] TEST MODE: Using fake token for testing: ${fakeToken.substring(0, 20)}...`);
        console.log('🧪 [PUSH NOTIFICATION] Note: This is a test token - FCM will reject it, but we can test the sending flow');
      }

      console.log(`📱 [PUSH NOTIFICATION] Found ${deviceTokens.length} active device token(s) for user ${userId}`);
      console.log(`📱 [PUSH NOTIFICATION] Preparing FCM message for ${deviceTokens.length} device(s)`);
      console.log(deviceTokens);

      // Prepare FCM message
      const message: admin.messaging.MulticastMessage = {
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.imageUrl,
        },
        data: payload.data || {},
        android: {
          priority: 'high',
          notification: {
            sound: payload.sound || 'default',
            channelId: 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: payload.sound || 'default',
              badge: payload.badge,
            },
          },
        },
        tokens: deviceTokens,
      };

      console.log('📱 [PUSH NOTIFICATION] Sending FCM message via Firebase Admin SDK...');
      
      // Send notification
      const response = await admin.messaging().sendEachForMulticast(message);

      console.log('📱 [PUSH NOTIFICATION] FCM Response received');
      console.log(`📱 [PUSH NOTIFICATION] Success Count: ${response.successCount}`);
      console.log(`📱 [PUSH NOTIFICATION] Failure Count: ${response.failureCount}`);

      // Update last_used_at for successful tokens
      if (response.successCount > 0) {
        const successfulTokens = deviceTokens.filter(
          (_, index) => response.responses[index].success
        );

        if (successfulTokens.length > 0) {
          console.log(`📱 [PUSH NOTIFICATION] Updating last_used_at for ${successfulTokens.length} successful token(s)`);
          await this.userDevicesRepository.updateTokenLastUsed(successfulTokens);
        }
      }

      // Log failed tokens and their errors
      if (response.failureCount > 0) {
        const failedTokens = deviceTokens.filter(
          (_, index) => !response.responses[index].success
        );

        console.warn(`⚠️  [PUSH NOTIFICATION] ${failedTokens.length} device token(s) failed to send`);

        // Log details of each failure
        response.responses.forEach((resp, index) => {
          if (!resp.success) {
            console.error(`❌ [PUSH NOTIFICATION] Token ${index + 1} failed:`, {
              error: resp.error?.code || 'UNKNOWN_ERROR',
              message: resp.error?.message || 'No error message',
            });
          }
        });

        if (failedTokens.length > 0) {
          console.log(`⚠️  [PUSH NOTIFICATION] Deactivating ${failedTokens.length} invalid device token(s)`);
          await this.userDevicesRepository.deactivateTokens(failedTokens);
          console.log(`✅ [PUSH NOTIFICATION] Deactivated ${failedTokens.length} invalid token(s)`);
        }
      }

      // Log final result
      if (response.successCount > 0) {
        console.log(`✅ [PUSH NOTIFICATION] SUCCESS: Sent to ${response.successCount} device(s), ${response.failureCount} failed`);
      } else {
        console.error(`❌ [PUSH NOTIFICATION] FAILURE: All ${response.failureCount} device(s) failed to receive notification`);
      }

      return {
        success: response.successCount > 0,
        sentCount: response.successCount,
      };
    } catch (error: any) {
      console.error('❌ [PUSH NOTIFICATION] ERROR: Exception occurred while sending push notification');
      console.error('❌ [PUSH NOTIFICATION] Error type:', error?.constructor?.name || 'Unknown');
      console.error('❌ [PUSH NOTIFICATION] Error message:', error?.message || String(error));
      console.error('❌ [PUSH NOTIFICATION] Error code:', error?.code || 'N/A');
      console.error('❌ [PUSH NOTIFICATION] Error stack:', error?.stack || 'No stack trace');
      
      if (error?.response) {
        console.error('❌ [PUSH NOTIFICATION] Error response:', {
          statusCode: error.response.statusCode,
          body: error.response.body,
        });
      }

      return {
        success: false,
        sentCount: 0,
        error: error.message || 'Failed to send notification',
      };
    }
  }

  /**
   * Send push notification to multiple users
   */
  async sendBulkPushNotifications(
    userIds: string[],
    payload: PushNotificationPayload
  ): Promise<{ success: boolean; totalSent: number }> {
    let totalSent = 0;
    for (const userId of userIds) {
      const result = await this.sendPushNotification(userId, payload);
      totalSent += result.sentCount;
    }
    return {
      success: totalSent > 0,
      totalSent,
    };
  }
}

