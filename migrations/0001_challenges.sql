-- Migration number: 0001 	 2025-02-15T22:28:56.974Z
CREATE TABLE IF NOT EXISTS challenges (
  challengeId INTEGER NOT NULL,
  solverName TEXT NOT NULL,
  token TEXT,
  gameState TEXT DEFAULT 'active',
  secret TEXT NOT NULL,
  secretLength INTEGER NOT NULL,
  guessesLeft INTEGER NOT NULL,
  score INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  levelScore INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (challengeId)
);

-- Optional: Add an index on token for faster lookups
CREATE INDEX IF NOT EXISTS idx_challenges_token ON challenges(token);
