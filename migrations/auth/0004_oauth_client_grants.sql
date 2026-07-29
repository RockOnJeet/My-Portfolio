CREATE TABLE oauth_client_grants (
  grant_id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  client_name TEXT,
  subject TEXT NOT NULL,
  resource TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  revoked_at INTEGER,
  UNIQUE (client_id, subject, resource)
);

CREATE INDEX idx_oauth_client_grants_subject ON oauth_client_grants (subject);
CREATE INDEX idx_oauth_client_grants_client_id ON oauth_client_grants (client_id);

ALTER TABLE oauth_authorization_codes ADD COLUMN grant_id TEXT;
-- Pre-migration authorization codes cannot be safely attached to a grant; they are short-lived and are invalidated on upgrade.
DELETE FROM oauth_authorization_codes;
ALTER TABLE oauth_access_tokens ADD COLUMN grant_id TEXT;

-- Preserve already-issued access after migration by grouping existing tokens by
-- immutable client identity + owner subject + protected resource.
INSERT INTO oauth_client_grants (grant_id, client_id, client_name, subject, resource, created_at, updated_at, revoked_at)
SELECT lower(hex(randomblob(16))), client_id, NULL, subject, resource, MIN(created_at), MAX(created_at), NULL
FROM oauth_access_tokens
GROUP BY client_id, subject, resource;

UPDATE oauth_access_tokens
SET grant_id = (
  SELECT grant_id FROM oauth_client_grants AS grants
  WHERE grants.client_id = oauth_access_tokens.client_id
    AND grants.subject = oauth_access_tokens.subject
    AND grants.resource = oauth_access_tokens.resource
)
WHERE grant_id IS NULL;

CREATE INDEX idx_oauth_access_tokens_grant_id ON oauth_access_tokens (grant_id);