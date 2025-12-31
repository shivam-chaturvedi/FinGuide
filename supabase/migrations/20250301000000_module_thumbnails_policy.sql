-- Allow the module-thumbnails bucket to be freely readable and editable by the service role
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for module thumbnails" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'module-thumbnails');

CREATE POLICY "Service role manages module thumbnails" ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'module-thumbnails')
  WITH CHECK (bucket_id = 'module-thumbnails');
