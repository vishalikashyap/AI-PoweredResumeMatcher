/*
  # Resume Analyzer Database Schema

  1. New Tables
    - `job_descriptions`
      - `id` (uuid, primary key) - Unique identifier for each job description
      - `user_id` (uuid) - References auth.users for row-level security
      - `title` (text) - Job title or description name
      - `description` (text) - The key value description to match against
      - `created_at` (timestamptz) - When the job description was created
      
    - `resume_analyses`
      - `id` (uuid, primary key) - Unique identifier for each analysis
      - `user_id` (uuid) - References auth.users for row-level security
      - `job_description_id` (uuid) - References job_descriptions
      - `resume_text` (text) - Extracted text from uploaded resume
      - `match_percentage` (integer) - Calculated match percentage (0-100)
      - `analysis_details` (jsonb) - Detailed analysis results including matched skills, missing skills, etc.
      - `created_at` (timestamptz) - When the analysis was performed

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
    - Users can only read, insert, update, and delete their own records
*/

CREATE TABLE IF NOT EXISTS job_descriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS resume_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  job_description_id uuid REFERENCES job_descriptions(id) ON DELETE CASCADE,
  resume_text text NOT NULL,
  match_percentage integer DEFAULT 0,
  analysis_details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE job_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own job descriptions"
  ON job_descriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own job descriptions"
  ON job_descriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own job descriptions"
  ON job_descriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own job descriptions"
  ON job_descriptions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own resume analyses"
  ON resume_analyses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resume analyses"
  ON resume_analyses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resume analyses"
  ON resume_analyses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own resume analyses"
  ON resume_analyses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_job_descriptions_user_id ON job_descriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_analyses_user_id ON resume_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_analyses_job_description_id ON resume_analyses(job_description_id);
