import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

import { getDb } from '../lib/db';
import { sql } from 'drizzle-orm';
import * as schema from '../src/db/drizzle/migrations/schema';

const db = getDb();

/**
 * Clear all tables in the correct order to respect foreign key constraints
 * Tables are cleared in reverse dependency order
 */
async function clearAllTables() {
  console.log('🗑️  Clearing all tables...\n');

  try {
    // Disable foreign key checks temporarily (PostgreSQL)
    await db.execute(sql`SET session_replication_role = 'replica';`);

    // Clear tables in reverse dependency order (child tables first, then parent tables)
    // Using CASCADE will automatically handle foreign key dependencies
    const tablesToClear = [
      // Child tables first
      'notification_preferences',
      'user_devices',
      'analytics_events',
      'support_tickets',
      'notification_recipients',
      'notifications',
      'audit_logs',
      'webhook_logs',
      'hospital_cancellation_flags',
      'assignment_payments',
      'assignment_ratings',
      'patient_consents',
      'assignments',
      'doctor_availability_history',
      'doctor_availability',
      'availability_templates',
      'doctor_hospital_affiliations',
      'doctor_leaves',
      'doctor_preferences',
      'doctor_profile_photos',
      'doctor_credentials',
      'doctor_specialties',
      'hospital_preferences',
      'hospital_documents',
      'hospital_departments',
      'patients',
      'payment_transactions',
      'subscriptions',
      'orders',
      'doctor_plan_features',
      'hospital_plan_features',
      'doctors',
      'hospitals',
      'files',
      'users',
      'specialties',
      'subscription_plans',
      // Enum tables (no dependencies) - clear these last
      'enum_priority',
      'enum_status',
      'enum_channel',
    ];

    let clearedCount = 0;
    for (const tableName of tablesToClear) {
      try {
        // Use TRUNCATE CASCADE to handle foreign key dependencies
        await db.execute(sql.raw(`TRUNCATE TABLE "${tableName}" CASCADE;`));
        console.log(`  ✅ Cleared ${tableName}`);
        clearedCount++;
      } catch (error: any) {
        // If table doesn't exist or has issues, log and continue
        const errorMessage = error.message || error.cause?.message || 'Unknown error';
        console.warn(`  ⚠️  Could not clear ${tableName}: ${errorMessage}`);
      }
    }

    // Re-enable foreign key checks
    await db.execute(sql`SET session_replication_role = 'origin';`);

    console.log(`\n✅ Cleared ${clearedCount} tables successfully!\n`);
  } catch (error) {
    console.error('❌ Error clearing tables:', error);
    // Re-enable foreign key checks even on error
    try {
      await db.execute(sql`SET session_replication_role = 'origin';`);
    } catch (e) {
      // Ignore
    }
    throw error;
  }
}

/**
 * Main function: Clear all tables, then seed
 */
async function clearAndSeed() {
  console.log('🚀 Starting clear and seed process...\n');
  console.log('⚠️  WARNING: This will DELETE ALL DATA from the database!\n');

  try {
    // Step 1: Clear all tables
    await clearAllTables();

    // Step 2: Import and run the seeding function
    console.log('🌱 Starting database seeding...\n');
    
    // Import the seed function
    const { seedDatabase } = await import('./seed-admin-dashboard');
    await seedDatabase();

    console.log('\n🎉 Clear and seed completed successfully!');
  } catch (error) {
    console.error('❌ Clear and seed failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  clearAndSeed()
    .then(() => {
      console.log('✅ Process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Process failed:', error);
      process.exit(1);
    });
}

export { clearAllTables, clearAndSeed };

