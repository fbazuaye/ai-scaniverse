-- Create scan_documents table to support multiple documents per scan
CREATE TABLE public.scan_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type VARCHAR(50),
  extracted_text TEXT,
  ai_summary TEXT,
  ai_tags TEXT[],
  category VARCHAR(50),
  is_sensitive BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.scan_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for scan_documents
CREATE POLICY "Users can view their own scan documents" 
ON public.scan_documents 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.scans 
    WHERE scans.id = scan_documents.scan_id 
    AND scans.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create scan documents for their own scans" 
ON public.scan_documents 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.scans 
    WHERE scans.id = scan_documents.scan_id 
    AND scans.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own scan documents" 
ON public.scan_documents 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.scans 
    WHERE scans.id = scan_documents.scan_id 
    AND scans.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own scan documents" 
ON public.scan_documents 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.scans 
    WHERE scans.id = scan_documents.scan_id 
    AND scans.user_id = auth.uid()
  )
);

-- Create index for better performance
CREATE INDEX idx_scan_documents_scan_id ON public.scan_documents(scan_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_scan_documents_updated_at
BEFORE UPDATE ON public.scan_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();