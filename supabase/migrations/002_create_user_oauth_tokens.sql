-- Create user_oauth_tokens table
-- Stores OAuth tokens for different providers (Gmail, etc.)
-- Supports future expansion to multiple OAuth providers

CREATE TABLE IF NOT EXISTS user_oauth_tokens (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'gmail',
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_oauth_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read their own tokens
CREATE POLICY "Users can read own oauth tokens" ON user_oauth_tokens
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policy: Users can only update their own tokens
CREATE POLICY "Users can update own oauth tokens" ON user_oauth_tokens
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policy: Users can only insert their own tokens
CREATE POLICY "Users can insert own oauth tokens" ON user_oauth_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only delete their own tokens
CREATE POLICY "Users can delete own oauth tokens" ON user_oauth_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_user_oauth_tokens_provider ON user_oauth_tokens(provider);
CREATE INDEX idx_user_oauth_tokens_expires_at ON user_oauth_tokens(expires_at);

-- Add comment
COMMENT ON TABLE user_oauth_tokens IS 'Stores OAuth tokens for each provider (Gmail, etc.) per user. Used for authenticating with third-party APIs.';
