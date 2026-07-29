CREATE TABLE auth_sessions (
  token_hash TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  subject TEXT NOT NULL,
  login TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE INDEX idx_auth_sessions_expires_at ON auth_sessions (expires_at);
