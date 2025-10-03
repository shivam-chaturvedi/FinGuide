-- Create storage bucket for modules
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'modules', 
  'modules', 
  true, 
  104857600, -- 100MB file size limit
  ARRAY[
    'image/*',
    'video/*',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload modules
CREATE POLICY "Authenticated users can upload modules" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'modules' 
  AND auth.role() = 'authenticated'
);

-- Create policy to allow public read access to modules
CREATE POLICY "Public can view modules" ON storage.objects
FOR SELECT USING (bucket_id = 'modules');

-- Create policy to allow admins to manage all module files
CREATE POLICY "Admins can manage module files" ON storage.objects
FOR ALL USING (
  bucket_id = 'modules' 
  AND EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
