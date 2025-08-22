-- Create beta_signups table for beta feature waitlist
CREATE TABLE IF NOT EXISTS beta_signups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  feature TEXT NOT NULL CHECK (feature IN ('reels', 'knowledge')),
  use_case TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notified BOOLEAN DEFAULT FALSE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_beta_signups_email ON beta_signups(email);
CREATE INDEX IF NOT EXISTS idx_beta_signups_feature ON beta_signups(feature);
CREATE INDEX IF NOT EXISTS idx_beta_signups_created_at ON beta_signups(created_at DESC);

-- Prevent duplicate signups for same email and feature
CREATE UNIQUE INDEX IF NOT EXISTS idx_beta_signups_unique ON beta_signups(email, feature);
