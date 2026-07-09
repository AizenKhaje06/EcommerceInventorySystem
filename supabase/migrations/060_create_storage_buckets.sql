-- Create storage buckets for file uploads
-- Migration: 060_create_storage_buckets.sql

-- Enable storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('chat-files', 'chat-files', true, 10485760, ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ]),
  ('product-images', 'product-images', true, 5242880, ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp'
  ]),
  ('profile-images', 'profile-images', true, 2097152, ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp'
  ]),
  ('order-attachments', 'order-attachments', true, 10485760, ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf'
  ])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for chat-files
CREATE POLICY "Users can upload chat files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chat-files');

CREATE POLICY "Users can view chat files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'chat-files');

CREATE POLICY "Users can delete own chat files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'chat-files' AND owner = auth.uid());

-- Storage policies for product-images
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');

-- Storage policies for profile-images
CREATE POLICY "Anyone can view profile images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-images');

CREATE POLICY "Users can upload own profile image"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-images');

CREATE POLICY "Users can update own profile image"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-images');

CREATE POLICY "Users can delete own profile image"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profile-images');

-- Storage policies for order-attachments
CREATE POLICY "Authenticated users can view order attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'order-attachments');

CREATE POLICY "Authenticated users can upload order attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'order-attachments');

CREATE POLICY "Authenticated users can delete order attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'order-attachments');

-- Add attachment columns to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_type TEXT,
ADD COLUMN IF NOT EXISTS attachment_name TEXT,
ADD COLUMN IF NOT EXISTS attachment_size INTEGER;

-- Add comment
COMMENT ON TABLE storage.buckets IS 'Storage buckets for file uploads: chat-files (10MB), product-images (5MB), profile-images (2MB), order-attachments (10MB)';
