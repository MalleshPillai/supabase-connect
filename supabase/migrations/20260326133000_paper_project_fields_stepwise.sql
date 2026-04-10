-- Extend "paper_projects" landing form fields (used by /paper-project)
-- Note: UI enforces step-wise validation, but these fields must exist in DB first.

INSERT INTO public.landing_form_fields
  (category, field_key, label, field_type, options, required, display_order, active)
VALUES
  ('paper_projects', 'graduate_level', 'Graduate (UG / PG)', 'select', '["UG","PG"]'::jsonb, true, 0, true),
  ('paper_projects', 'project_title', 'Project title (type custom if you don''t have one)', 'text', '[]'::jsonb, true, 1, true),
  ('paper_projects', 'department', 'Department', 'text', '[]'::jsonb, true, 2, true),
  ('paper_projects', 'num_pages', 'No of pages', 'text', '[]'::jsonb, true, 3, true),
  ('paper_projects', 'front_page_color', 'Front page: Color or Black and white', 'select', '["Color","Black and white"]'::jsonb, true, 4, true),
  ('paper_projects', 'roll_number', 'Roll Number', 'text', '[]'::jsonb, true, 5, true),
  ('paper_projects', 'college', 'College', 'text', '[]'::jsonb, true, 6, true),
  -- Keep the existing abstract fields but normalize display order for better step-wise grouping
  ('paper_projects', 'abstract_text', 'Abstract (optional)', 'textarea', '[]'::jsonb, false, 7, true),
  ('paper_projects', 'abstract_file', 'Upload abstract (PDF/DOC if any)', 'file', '[]'::jsonb, false, 8, true),
  ('paper_projects', 'notes', 'Additional notes or requirements', 'textarea', '[]'::jsonb, false, 9, true)
ON CONFLICT (category, field_key) DO UPDATE SET
  label = EXCLUDED.label,
  field_type = EXCLUDED.field_type,
  options = EXCLUDED.options,
  required = EXCLUDED.required,
  display_order = EXCLUDED.display_order,
  active = EXCLUDED.active;

