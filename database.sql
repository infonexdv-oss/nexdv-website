-- Create the software table
CREATE TABLE software (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('pc', 'mobile')),
  short_description text,
  description text,
  version text,
  download_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the screenshots table
CREATE TABLE screenshots (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  software_id uuid REFERENCES software(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the messages table for contact forms
CREATE TABLE messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE software ENABLE ROW LEVEL SECURITY;
ALTER TABLE screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow public read access to software and screenshots
CREATE POLICY "Public can view software" ON software FOR SELECT USING (true);
CREATE POLICY "Public can view screenshots" ON screenshots FOR SELECT USING (true);

-- Allow public to insert messages (contact form)
CREATE POLICY "Public can insert messages" ON messages FOR INSERT WITH CHECK (true);

-- Allow authenticated admins full access
CREATE POLICY "Admins have full access to software" ON software FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins have full access to screenshots" ON screenshots FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can view and delete messages" ON messages FOR ALL USING (auth.role() = 'authenticated');
