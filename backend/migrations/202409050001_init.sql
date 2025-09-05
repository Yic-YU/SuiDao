-- Create daos table
CREATE TABLE IF NOT EXISTS daos (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  symbol TEXT NOT NULL,
  member_count INTEGER NOT NULL DEFAULT 0,
  proposal_count INTEGER NOT NULL DEFAULT 0,
  treasury TEXT NOT NULL DEFAULT '0 SUI',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

-- Create proposals table
CREATE TABLE IF NOT EXISTS proposals (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  dao_state_id TEXT NOT NULL,
  status TEXT NOT NULL,
  proposal_type TEXT NOT NULL,
  votes_for INTEGER NOT NULL DEFAULT 0,
  votes_against INTEGER NOT NULL DEFAULT 0,
  total_votes INTEGER NOT NULL DEFAULT 0,
  end_time TIMESTAMPTZ NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

-- Helpful index
CREATE INDEX IF NOT EXISTS idx_proposals_dao_state_id ON proposals(dao_state_id);

