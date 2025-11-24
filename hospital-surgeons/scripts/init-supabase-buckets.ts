/**
 * Script to initialize Supabase Storage buckets
 * 
 * This script creates the required storage buckets in Supabase.
 * 
 * Usage:
 * 1. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file
 * 2. Run: npx tsx scripts/init-supabase-buckets.ts
 * 
 * Note: SUPABASE_SERVICE_ROLE_KEY is different from SUPABASE_ANON_KEY
 * You can find it in Supabase Dashboard > Settings > API > service_role key
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const buckets = [
  {
    name: 'images',
    public: true,
    description: 'General images and profile photos',
  },
  {
    name: 'documents',
    public: false, // Credentials should be private
    description: 'Doctor credentials and documents',
  },
];

async function initBuckets() {
  console.log('Initializing Supabase Storage buckets...\n');

  for (const bucketConfig of buckets) {
    try {
      // Check if bucket exists
      const { data: existingBuckets } = await supabase.storage.listBuckets();
      const bucketExists = existingBuckets?.some(b => b.name === bucketConfig.name);

      if (bucketExists) {
        console.log(`✓ Bucket '${bucketConfig.name}' already exists`);
        continue;
      }

      // Create bucket
      const { data, error } = await supabase.storage.createBucket(bucketConfig.name, {
        public: bucketConfig.public,
        allowedMimeTypes: null, // Allow all file types
        fileSizeLimit: 52428800, // 50MB
      });

      if (error) {
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          console.log(`✓ Bucket '${bucketConfig.name}' already exists`);
        } else {
          console.error(`✗ Failed to create bucket '${bucketConfig.name}':`, error.message);
        }
      } else {
        console.log(`✓ Created bucket '${bucketConfig.name}' (public: ${bucketConfig.public})`);
      }
    } catch (error) {
      console.error(`✗ Error processing bucket '${bucketConfig.name}':`, error);
    }
  }

  console.log('\n✓ Bucket initialization complete!');
  console.log('\nNote: If buckets were not created, you may need to create them manually in Supabase Dashboard:');
  console.log('  1. Go to Storage > Buckets');
  console.log('  2. Click "New bucket"');
  console.log('  3. Create buckets: "images" (public) and "documents" (private)');
}

initBuckets().catch(console.error);

