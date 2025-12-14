/**
 * Migration Script: Add max_assignments_per_month to doctor_plan_features
 * 
 * This script adds the max_assignments_per_month column to the doctor_plan_features table
 * 
 * Usage: npx tsx scripts/add-max-assignments-column.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { getDb } from '../lib/db/index';
import { sql } from 'drizzle-orm';

async function addMaxAssignmentsColumn() {
  try {
    const db = getDb();
    
    console.log('Adding max_assignments_per_month column to doctor_plan_features table...');
    
    // Add the column if it doesn't exist
    await db.execute(sql`
      ALTER TABLE doctor_plan_features 
      ADD COLUMN IF NOT EXISTS max_assignments_per_month INTEGER;
    `);
    
    // Add comment to the column
    await db.execute(sql`
      COMMENT ON COLUMN doctor_plan_features.max_assignments_per_month IS 
      'Maximum number of assignments per month. Use -1 for unlimited, NULL for not set.';
    `);
    
    console.log('✅ Successfully added max_assignments_per_month column to doctor_plan_features table');
    
    // Verify the column was added
    const result = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'doctor_plan_features' 
      AND column_name = 'max_assignments_per_month';
    `);
    
    if (result.rows && result.rows.length > 0) {
      console.log('✅ Column verified in database');
      console.log('Column details:', result.rows[0]);
    } else {
      console.log('⚠️  Warning: Column not found after creation');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding column:', error);
    process.exit(1);
  }
}

addMaxAssignmentsColumn();

