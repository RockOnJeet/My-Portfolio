CREATE TABLE oauth_transactions (
  id_hash TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  client_name TEXT,
  redirect_uri TEXT NOT NULL,
  state TEXT,
  code_challenge TEXT NOT NULL,
  resource TEXT NOT NULL,
  scope TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE INDEX idx_oauth_transactions_expires_at ON oauth_transactions (expires_at);

CREATE TABLE oauth_authorization_codes (
  code_hash TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  redirect_uri TEXT NOT NULL,
  subject TEXT NOT NULL,
  code_challenge TEXT NOT NULL,
  resource TEXT NOT NULL,
  scope TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE INDEX idx_oauth_authorization_codes_expires_at ON oauth_authorization_codes (expires_at);
