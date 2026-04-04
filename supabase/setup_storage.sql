-- Buat bucket imports jika belum ada
INSERT INTO storage.buckets (id, name, public) 
VALUES ('imports', 'imports', false)
ON CONFLICT (id) DO NOTHING;

-- Berikan akses RLS ke objects di dalam bucket imports
CREATE POLICY "Users can upload their own imports" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'imports' AND (auth.uid() = owner OR auth.uid()::text = (storage.foldername(name))[1]));

CREATE POLICY "Users can view their own imports" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'imports' AND (auth.uid() = owner OR auth.uid()::text = (storage.foldername(name))[1]));
