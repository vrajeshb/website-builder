/*
  # Create projects table for website builder
  
  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `name` (text) - Project name
      - `components` (jsonb) - Array of dropped components
      - `settings` (jsonb) - Project settings (title, description, etc.)
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `projects` table
    - Add policy for public access (no auth required as specified)

  3. Indexes
    - Index on updated_at for sorting
    - Index on name for searching
*/

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Untitled Project',
  components jsonb DEFAULT '[]',
  settings jsonb DEFAULT '{"title": "My Website", "description": "A website built with drag and drop builder"}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Allow public access to projects (no authentication required)
CREATE POLICY "Public access for projects"
  ON projects
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_name ON projects(name);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);