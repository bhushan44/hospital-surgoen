/**
 * Firebase Initialization Test Script
 * Tests if Firebase Admin SDK is properly initialized
 * 
 * Usage: npx tsx scripts/test-firebase-init.ts
 */

import * as admin from 'firebase-admin';
import { config } from 'dotenv';
import * as path from 'path';

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local');
config({ path: envPath });

async function testFirebaseInit() {
  console.log('🔥 [FIREBASE TEST] Starting Firebase initialization test...\n');

  // Check if Firebase credentials are provided
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    console.error('❌ [FIREBASE TEST] FIREBASE_SERVICE_ACCOUNT_KEY is not set in .env.local');
    console.error('❌ [FIREBASE TEST] Please add FIREBASE_SERVICE_ACCOUNT_KEY to your .env.local file');
    process.exit(1);
  }

  console.log('✅ [FIREBASE TEST] FIREBASE_SERVICE_ACCOUNT_KEY found');
  console.log(`📝 [FIREBASE TEST] Key length: ${serviceAccountKey.length} characters`);
  console.log(`📝 [FIREBASE TEST] Key starts with: ${serviceAccountKey.substring(0, 30)}...\n`);

  // Parse the service account key
  let serviceAccount: admin.ServiceAccount;

  try {
  // Trim whitespace
  let trimmedKey = serviceAccountKey.trim();

  // Remove outer quotes if present
  const hadQuotes =
    (trimmedKey.startsWith('"') && trimmedKey.endsWith('"')) ||
    (trimmedKey.startsWith("'") && trimmedKey.endsWith("'"));

  if (hadQuotes) {
    trimmedKey = trimmedKey.slice(1, -1).trim();
    console.log('📝 [FIREBASE TEST] Removed outer quotes');
  }

  // Check if it's JSON string or file path
  const isJsonString = trimmedKey.startsWith('{');

  if (isJsonString) {
    // Parse JSON string
    try {
      serviceAccount = JSON.parse(trimmedKey);
      console.log('✅ [FIREBASE TEST] Successfully parsed JSON string');
    } catch (parseError: any) {
      // Try unescaping
      const unescaped = trimmedKey
        .replace(/\\"/g, '"')
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\\\/g, '\\');
      
      serviceAccount = JSON.parse(unescaped);
      console.log('✅ [FIREBASE TEST] Successfully parsed after unescaping');
    }
  } else {
    // Read from file
    const fs = require('fs');
    const keyPath = path.resolve(trimmedKey);
    
    if (!fs.existsSync(keyPath)) {
      throw new Error(`File not found: ${keyPath}`);
    }
    
    serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    console.log('✅ [FIREBASE TEST] Successfully read from file');
  }

  // Validate required fields
  const account = serviceAccount as any;
  if (!account.project_id && !account.projectId) {
    throw new Error('Missing project_id');
  }
  if (!account.private_key && !account.privateKey) {
    throw new Error('Missing private_key');
  }
  if (!account.client_email && !account.clientEmail) {
    throw new Error('Missing client_email');
  }

  console.log('✅ [FIREBASE TEST] All required fields present');
  console.log(`📝 [FIREBASE TEST] Project ID: ${account.project_id || account.projectId}`);
  console.log(`📝 [FIREBASE TEST] Client Email: ${account.client_email || account.clientEmail}\n`);

  // Fix private key newlines
  let privateKey = account.private_key || account.privateKey;
  if (privateKey && typeof privateKey === 'string') {
    if (privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
      console.log('✅ [FIREBASE TEST] Fixed private key newlines');
    }
    privateKey = privateKey.trim();
    
    const hasCorrectStart = privateKey.startsWith('-----BEGIN');
    const hasCorrectEnd = privateKey.includes('-----END PRIVATE KEY-----');
    
    console.log(`📝 [FIREBASE TEST] Private key starts correctly: ${hasCorrectStart}`);
    console.log(`📝 [FIREBASE TEST] Private key ends correctly: ${hasCorrectEnd}`);
    console.log(`📝 [FIREBASE TEST] Private key length: ${privateKey.length} characters\n`);
  }

  // Normalize service account
  const normalizedAccount: admin.ServiceAccount = {
    projectId: account.project_id || account.projectId,
    privateKey: privateKey || account.private_key || account.privateKey,
    clientEmail: account.client_email || account.clientEmail,
  };

  // Check if Firebase is already initialized
  if (admin.apps.length > 0) {
    const existingApp = admin.apps[0];
    if (existingApp) {
      console.log('⚠️  [FIREBASE TEST] Firebase app already exists, deleting it first...');
      try {
        await existingApp.delete();
        console.log('✅ [FIREBASE TEST] Deleted existing app\n');
      } catch (deleteError: any) {
        console.log('⚠️  [FIREBASE TEST] Could not delete existing app:', deleteError.message);
      }
    }
  }

  // Initialize Firebase
  console.log('🔄 [FIREBASE TEST] Initializing Firebase Admin SDK...');
  const app = admin.initializeApp({
    credential: admin.credential.cert(normalizedAccount),
  });

  console.log('✅ [FIREBASE TEST] Firebase Admin SDK initialized successfully!');
  console.log(`📝 [FIREBASE TEST] App name: ${app.name}`);
  console.log(`📝 [FIREBASE TEST] Project ID: ${app.options.projectId}\n`);

  // Test Firebase functionality
  console.log('🧪 [FIREBASE TEST] Testing Firebase functionality...');
  
  // Test: Get project ID
  const projectId = app.options.projectId;
  if (projectId) {
    console.log(`✅ [FIREBASE TEST] Project ID accessible: ${projectId}`);
  } else {
    console.error('❌ [FIREBASE TEST] Project ID not accessible');
  }

  // Test: Check if messaging is available
  try {
    const messaging = admin.messaging();
    console.log('✅ [FIREBASE TEST] Messaging service available');
  } catch (error: any) {
    console.error('❌ [FIREBASE TEST] Messaging service not available:', error.message);
  }

  console.log('\n✅✅✅ [FIREBASE TEST] SUCCESS! Firebase is properly initialized! ✅✅✅\n');
  
  // Clean up
  try {
    await app.delete();
    console.log('🧹 [FIREBASE TEST] Cleaned up test app');
  } catch (cleanupError: any) {
    console.log('⚠️  [FIREBASE TEST] Could not clean up app:', cleanupError.message);
  }

  process.exit(0);

} catch (error: any) {
  console.error('\n❌❌❌ [FIREBASE TEST] FAILED! ❌❌❌\n');
  console.error('❌ [FIREBASE TEST] Error:', error.message);
  console.error('❌ [FIREBASE TEST] Stack:', error.stack);
  
  if (error.message?.includes('already exists')) {
    console.error('\n💡 [FIREBASE TEST] Tip: Firebase app already exists. This is normal in Next.js.');
    console.error('💡 [FIREBASE TEST] The app will be reused automatically in your application.');
  }
  
    process.exit(1);
  }
}

// Run the test
testFirebaseInit().catch((error) => {
  console.error('\n❌❌❌ [FIREBASE TEST] UNEXPECTED ERROR! ❌❌❌\n');
  console.error('❌ [FIREBASE TEST] Error:', error);
  process.exit(1);
});

