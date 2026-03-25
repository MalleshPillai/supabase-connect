-- Landing categories: move all existing services under Xerox and Prints
UPDATE public.services SET category = 'Xerox and Prints' WHERE true;
ALTER TABLE public.services ALTER COLUMN category SET DEFAULT 'Xerox and Prints';

-- Dynamic form fields for Paper projects & Graphic design landing flows
CREATE TABLE IF NOT EXISTS public.landing_form_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('paper_projects', 'graphic_design')),
  field_key text NOT NULL,
  label text NOT NULL,
  field_type text NOT NULL CHECK (field_type IN ('text', 'textarea', 'file', 'select')),
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  required boolean NOT NULL DEFAULT false,
  display_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE (category, field_key)
);

CREATE INDEX IF NOT EXISTS landing_form_fields_category_order_idx
  ON public.landing_form_fields (category, display_order);

-- Paper project intake (structured + file URLs in JSON)
CREATE TABLE IF NOT EXISTS public.paper_project_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text,
  email text,
  responses jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS paper_project_submissions_created_idx
  ON public.paper_project_submissions (created_at DESC);

ALTER TABLE public.landing_form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paper_project_submissions ENABLE ROW LEVEL SECURITY;

-- Public can read active fields for rendering forms
CREATE POLICY "Anyone can read active landing form fields"
ON public.landing_form_fields FOR SELECT
USING (active = true);

CREATE POLICY "Admins can read all landing form fields"
ON public.landing_form_fields FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert landing form fields"
ON public.landing_form_fields FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update landing form fields"
ON public.landing_form_fields FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete landing form fields"
ON public.landing_form_fields FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can submit paper project"
ON public.paper_project_submissions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can read paper project submissions"
ON public.paper_project_submissions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete paper project submissions"
ON public.paper_project_submissions FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Public uploads for paper project attachments (optional abstract files)
INSERT INTO storage.buckets (id, name, public)
VALUES ('paper-submissions', 'paper-submissions', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can upload paper submission files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'paper-submissions');

CREATE POLICY "Anyone can read paper submission files"
ON storage.objects FOR SELECT
USING (bucket_id = 'paper-submissions');

CREATE POLICY "Admins can delete paper submission files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'paper-submissions'
  AND public.has_role(auth.uid(), 'admin')
);

-- Seed default paper fields (admin can edit)
INSERT INTO public.landing_form_fields (category, field_key, label, field_type, required, display_order, active)
VALUES
  ('paper_projects', 'project_title', 'Project / paper title', 'text', true, 0, true),
  ('paper_projects', 'abstract_text', 'Abstract (text, optional)', 'textarea', false, 1, true),
  ('paper_projects', 'abstract_file', 'Upload abstract (PDF/DOC if any)', 'file', false, 2, true),
  ('paper_projects', 'notes', 'Additional notes or requirements', 'textarea', false, 3, true)
ON CONFLICT (category, field_key) DO NOTHING;
