# Supabase Storage Setup Guide

## Creating the Resources Storage Bucket

1. **Go to Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/YOUR_PROJECT_ID/storage/buckets
   ```

2. **Create New Bucket:**
   - Click "New bucket"
   - Name: `resources`
   - Public bucket: **Yes** ✅ (for easy file downloads)
   - Click "Create bucket"

3. **Set Bucket Policies (Optional for Auth):**
   
   Go to Storage Policies and add these rules:

   **Allow authenticated uploads:**
   ```sql
   CREATE POLICY "Allow authenticated uploads"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'resources');
   ```

   **Allow public downloads:**
   ```sql
   CREATE POLICY "Allow public downloads"  
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'resources');
   ```

   **Allow users to delete their own files:**
   ```sql
   CREATE POLICY "Users can delete own files"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (bucket_id = 'resources' AND auth.uid() = owner);
   ```

## File Upload Now Works!

Once the bucket is created, the app will automatically use Supabase Storage for uploads instead of blob URLs.

**Benefits:**
- ✅ Persistent file storage
- ✅ Files accessible from anywhere
- ✅ Automatic CDN distribution
- ✅ Proper download URLs
