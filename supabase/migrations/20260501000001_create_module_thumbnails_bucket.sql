-- Create storage bucket for module thumbnails (idempotent)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'module-thumbnails',
  'module-thumbnails',
  true,
  10485760, -- 10MB
  ARRAY['image/*']
)
ON CONFLICT (id) DO NOTHING;

