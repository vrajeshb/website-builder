/*
  # Create components table for website builder
  
  1. New Tables
    - `components`
      - `id` (uuid, primary key)
      - `name` (text) - Component display name
      - `category` (text) - Component category (header, footer, etc.)
      - `html` (text) - HTML content
      - `css` (text, optional) - Custom CSS
      - `js` (text, optional) - Custom JavaScript
      - `preview_image` (text, optional) - Preview image URL
      - `tags` (text[]) - Searchable tags
      - `is_premium` (boolean) - Premium component flag
      - `created_at` (timestamptz) - Creation timestamp

  2. Security
    - Enable RLS on `components` table
    - Add policy for public read access
    - Add policy for authenticated insert (for uploads)

  3. Indexes
    - Index on category for filtering
    - Index on tags for search functionality
*/

CREATE TABLE IF NOT EXISTS components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('header', 'footer', 'hero', 'pricing', 'features', 'contact', 'testimonials', 'gallery', 'blog', 'custom')),
  html text NOT NULL,
  css text DEFAULT '',
  js text DEFAULT '',
  preview_image text,
  tags text[] DEFAULT '{}',
  is_premium boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
  ai_generated boolean DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE components ENABLE ROW LEVEL SECURITY;

-- Allow public read access to components
CREATE POLICY "Public read access for components"
  ON components
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to insert components
CREATE POLICY "Authenticated users can create components"
  ON components
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_components_category ON components(category);
CREATE INDEX IF NOT EXISTS idx_components_tags ON components USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_components_created_at ON components(created_at DESC);