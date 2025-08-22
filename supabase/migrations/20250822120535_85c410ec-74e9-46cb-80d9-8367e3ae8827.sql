-- Create scans table for AI ScanPro
CREATE TABLE public.scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content_type VARCHAR(50) NOT NULL, -- 'document', 'image', 'pdf'
  file_path TEXT NOT NULL,
  file_size INTEGER,
  extracted_text TEXT,
  ai_summary TEXT,
  ai_tags TEXT[], -- Array of AI-generated tags
  category TEXT, -- 'passport', 'invoice', 'photo', etc.
  is_sensitive BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own scans" 
ON public.scans 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scans" 
ON public.scans 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scans" 
ON public.scans 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scans" 
ON public.scans 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_scans_updated_at
BEFORE UPDATE ON public.scans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_scans_user_id ON public.scans(user_id);
CREATE INDEX idx_scans_category ON public.scans(category);
CREATE INDEX idx_scans_created_at ON public.scans(created_at DESC);
CREATE INDEX idx_scans_ai_tags ON public.scans USING GIN(ai_tags);

-- Create storage bucket for scanned files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('scans', 'scans', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for scans bucket
CREATE POLICY "Users can view their own scan files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'scans' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own scan files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'scans' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own scan files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'scans' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own scan files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'scans' AND auth.uid()::text = (storage.foldername(name))[1]);