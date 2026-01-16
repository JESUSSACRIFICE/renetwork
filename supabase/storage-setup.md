# Supabase Storage Bucket Setup

## Required Buckets

The registration system requires the following storage bucket:

- **Bucket Name:** `documents`
- **Public:** No (private bucket recommended for sensitive documents)
- **File Size Limit:** 10MB per file (can be configured)
- **Allowed MIME Types:** `image/*`, `application/pdf`

## Setup Instructions

### Option 1: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Configure the bucket:
   - **Name:** `documents`
   - **Public bucket:** Leave unchecked (private)
   - Click **Create bucket**

5. Set up RLS (Row Level Security) policies:
   - Click on the `documents` bucket
   - Go to **Policies** tab
   - Add the following policies:

#### Policy 1: Users can upload their own files
```
Policy Name: Users can upload own documents
Target Roles: authenticated
Policy Definition: 
  (bucket_id = 'documents'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])
```

#### Policy 2: Users can view their own files
```
Policy Name: Users can view own documents
Target Roles: authenticated
Policy Definition:
  (bucket_id = 'documents'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])
```

#### Policy 3: Users can delete their own files
```
Policy Name: Users can delete own documents
Target Roles: authenticated
Policy Definition:
  (bucket_id = 'documents'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])
```

### Option 2: Using SQL (via Supabase SQL Editor)

Run this SQL in your Supabase SQL Editor:

```sql
-- Create the documents bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: Users can upload files to their own folder
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can view their own files
CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own files
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## Folder Structure

Files are organized in the bucket as follows:
```
documents/
  {user_id}/
    identity/
      {timestamp}-{random}.{ext}
    licenses/
      {timestamp}-{random}.{ext}
    insurance/
      {timestamp}-{random}.{ext}
    purchase-documents/
      {timestamp}-{random}.{ext}
```

## Verification

After creating the bucket, test it by:
1. Navigating to the registration page
2. Trying to upload a file
3. If you see "Bucket not found" error, verify the bucket name matches exactly: `documents`

## Troubleshooting

### Error: "Bucket not found"
- Verify the bucket name is exactly `documents` (case-sensitive)
- Ensure the bucket exists in your Supabase project
- Check that you're using the correct Supabase project

### Error: "Permission denied"
- Verify RLS policies are set up correctly
- Ensure the user is authenticated
- Check that the policies allow INSERT/SELECT/DELETE operations

### Files not uploading
- Check file size (must be under 10MB)
- Verify file type is allowed (images or PDFs)
- Check browser console for detailed error messages




