/**
 * Clear Database Script
 * 
 * This script clears all data from all tables (except users table)
 * 
 * Usage: npx tsx scripts/clear-database.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { getDb } from '../lib/db/index';
import { sql } from 'drizzle-orm';

async function clearAllTables() {
  console.log('🗑️  Clearing all tables (except users)...\n');
  const db = getDb();

  // Delete in reverse order of dependencies
  const tablesToClear = [
    'notifications',
    'audit_logs',
    'analytics_events',
    'support_tickets',
    'user_devices',
    'notification_preferences',
    'subscriptions',
    'plan_pricing',
    'doctor_plan_features',
    'hospital_plan_features',
    'subscription_plans',
    'assignment_ratings',
    'assignment_payments',
    'hospital_cancellation_flags',
    'assignments',
    'doctor_assignment_usage',
    'doctor_availability_history',
    'doctor_availability',
    'patient_consents',
    'patients',
    'doctor_credentials',
    'doctor_profile_photos',
    'doctor_specialties',
    'doctor_hospital_affiliations',
    'hospital_preferences',
    'hospital_departments',
    'hospital_documents',
    'doctors',
    'hospitals',
    'payment_transactions',
    'orders',
    'files',
    'specialties',
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const table of tablesToClear) {
    try {
      await db.execute(sql.raw(`TRUNCATE TABLE ${table} CASCADE`));
      console.log(`  ✓ Cleared ${table}`);
      successCount++;
    } catch (error) {
      console.error(`  ✗ Error clearing ${table}:`, (error as Error).message);
      errorCount++;
    }
  }

  console.log(`\n✅ Clear completed!`);
  console.log(`   Success: ${successCount} tables`);
  console.log(`   Errors: ${errorCount} tables\n`);
}

async function main() {
  try {
    await clearAllTables();
    console.log('✨ Database cleared successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

main();

