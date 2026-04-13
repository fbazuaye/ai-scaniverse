
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'driver',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can delete their own profile" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Deny anonymous access to profiles" ON public.profiles FOR ALL TO anon USING (false);

-- Create scans table
CREATE TABLE public.scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  content_type VARCHAR NOT NULL,
  file_size INTEGER,
  extracted_text TEXT,
  ai_summary TEXT,
  ai_tags TEXT[],
  category TEXT,
  is_sensitive BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scans" ON public.scans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own scans" ON public.scans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own scans" ON public.scans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own scans" ON public.scans FOR DELETE USING (auth.uid() = user_id);

-- Create scan_documents table
CREATE TABLE public.scan_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type VARCHAR,
  file_size INTEGER,
  extracted_text TEXT,
  ai_summary TEXT,
  ai_tags TEXT[],
  category VARCHAR,
  is_sensitive BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.scan_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scan documents" ON public.scan_documents FOR SELECT USING (EXISTS (SELECT 1 FROM scans WHERE scans.id = scan_documents.scan_id AND scans.user_id = auth.uid()));
CREATE POLICY "Users can create scan documents for their own scans" ON public.scan_documents FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM scans WHERE scans.id = scan_documents.scan_id AND scans.user_id = auth.uid()));
CREATE POLICY "Users can update their own scan documents" ON public.scan_documents FOR UPDATE USING (EXISTS (SELECT 1 FROM scans WHERE scans.id = scan_documents.scan_id AND scans.user_id = auth.uid()));
CREATE POLICY "Users can delete their own scan documents" ON public.scan_documents FOR DELETE USING (EXISTS (SELECT 1 FROM scans WHERE scans.id = scan_documents.scan_id AND scans.user_id = auth.uid()));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_scans_updated_at BEFORE UPDATE ON public.scans FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_scan_documents_updated_at BEFORE UPDATE ON public.scan_documents FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create handle_new_user function for auto profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create scans storage bucket (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('scans', 'scans', false);

-- Storage RLS policies
CREATE POLICY "Users can upload their own scans" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'scans' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view their own scans" ON storage.objects FOR SELECT USING (bucket_id = 'scans' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own scans" ON storage.objects FOR UPDATE USING (bucket_id = 'scans' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own scans" ON storage.objects FOR DELETE USING (bucket_id = 'scans' AND auth.uid()::text = (storage.foldername(name))[1]);
