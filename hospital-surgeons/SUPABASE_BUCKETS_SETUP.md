# Supabase Storage Buckets Setup

This application requires Supabase Storage buckets to be created before file uploads will work.

## Required Buckets

1. **`images`** (public)
   - Used for: Profile photos, general images
   - Access: Public
   - Max file size: 50MB

2. **`documents`** (private)
   - Used for: Doctor credentials, sensitive documents
   - Access: Private (requires authentication)
   - Max file size: 50MB

## Setup Methods

### Method 1: Using the Initialization Script (Recommended)

1. Add `SUPABASE_SERVICE_ROLE_KEY` to your `.env` file:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. Find your service role key in Supabase Dashboard:
   - Go to Settings > API
   - Copy the `service_role` key (⚠️ Keep this secret!)

3. Run the initialization script:
   ```bash
   npx tsx scripts/init-supabase-buckets.ts
   ```

### Method 2: Manual Setup via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Storage** > **Buckets**
3. Click **New bucket** for each bucket:

   **Bucket 1: `images`**
   - Name: `images`
   - Public bucket: ✅ **Enabled** (check this)
   - File size limit: 50MB
   - Allowed MIME types: Leave empty (allows all types)

   **Bucket 2: `documents`**
   - Name: `documents`
   - Public bucket: ❌ **Disabled** (uncheck this)
   - File size limit: 50MB
   - Allowed MIME types: Leave empty (allows all types)

4. Click **Create bucket** for each

## Verify Setup

After creating buckets, try uploading a file. If you see "Bucket not found" errors, verify:

1. Bucket names match exactly: `images` and `documents` (case-sensitive)
2. Bucket permissions are set correctly (images = public, documents = private)
3. Your Supabase project URL and keys are correct in `.env`

## Troubleshooting

### Error: "Bucket not found"

- Verify bucket names are correct (case-sensitive)
- Check that buckets exist in Supabase Dashboard > Storage > Buckets
- Ensure you're using the correct Supabase project

### Error: "Permission denied"

- For `images` bucket: Ensure it's marked as **public**
- For `documents` bucket: Ensure your API key has proper permissions
- Check RLS (Row Level Security) policies if applicable

### Error: "File size limit exceeded"

- Default limit is 50MB per file
- Increase limit in bucket settings if needed
- Or reduce file size before uploading

## Security Notes

- ⚠️ Never commit `SUPABASE_SERVICE_ROLE_KEY` to version control
- The `documents` bucket should remain **private** for security
- The `images` bucket can be **public** for profile photos
- Consider adding RLS policies for additional security

