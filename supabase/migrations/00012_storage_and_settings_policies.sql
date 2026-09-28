-- ============================================================================
-- Star Academy ERP - Migration 00012: Storage Bucket Policies for Academy Assets
-- ============================================================================

-- Drop restrictive authenticated-only admin policies
DROP POLICY IF EXISTS "Admins can upload Academy Assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update Academy Assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete Academy Assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload to academy-assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update to academy-assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete from academy-assets" ON storage.objects;

-- Allow public / anon uploads to academy-assets bucket
CREATE POLICY "Allow public upload to academy-assets"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'academy-assets');

CREATE POLICY "Allow public update to academy-assets"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'academy-assets')
WITH CHECK (bucket_id = 'academy-assets');

CREATE POLICY "Allow public delete from academy-assets"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'academy-assets');
