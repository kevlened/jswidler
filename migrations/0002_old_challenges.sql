-- Migration number: 0002 	 2025-02-15T22:29:56.974Z

-- Insert historical challenge records
INSERT INTO challenges (
  challengeId,
  solverName,
  score,
  level,
  gameState,
  secret,
  secretLength,
  guessesLeft,
  levelScore,
  created_at
) VALUES
  (1286, 'Jeff sat', 2278, 36, 'complete', '', 74, 0, 0, CURRENT_TIMESTAMP),
  (3044, 'HisMajesty', 2014, 34, 'complete', '', 70, 0, 0, CURRENT_TIMESTAMP),
  (327, 'deeperblue', 2000, 34, 'complete', '', 70, 0, 0, CURRENT_TIMESTAMP),
  (1272, 'az', 1758, 32, 'complete', '', 66, 0, 0, CURRENT_TIMESTAMP),
  (1117, 'Jeff search', 1640, 31, 'complete', '', 64, 0, 0, CURRENT_TIMESTAMP),
  (1279, 'joy', 1583, 30, 'complete', '', 62, 0, 0, CURRENT_TIMESTAMP),
  (1947, 'wangsta', 1473, 29, 'complete', '', 60, 0, 0, CURRENT_TIMESTAMP),
  (1234, 'winston', 1427, 29, 'complete', '', 60, 0, 0, CURRENT_TIMESTAMP),
  (8, 'rc1', 1341, 28, 'complete', '', 58, 0, 0, CURRENT_TIMESTAMP),
  (248, 'Jesse''s Second Solver', 1336, 28, 'complete', '', 58, 0, 0, CURRENT_TIMESTAMP),
  (2670, 'drwrchrds', 1235, 27, 'complete', '', 56, 0, 0, CURRENT_TIMESTAMP),
  (244, 'iHector', 1217, 27, 'complete', '', 56, 0, 0, CURRENT_TIMESTAMP),
  (1034, 'Jeff naive optimized', 1030, 25, 'complete', '', 52, 0, 0, CURRENT_TIMESTAMP),
  (1231, 'kevin', 940, 24, 'complete', '', 50, 0, 0, CURRENT_TIMESTAMP),
  (205, 'Curl', 909, 23, 'complete', '', 48, 0, 0, CURRENT_TIMESTAMP),
  (539, 'Jesse''s Solver', 889, 23, 'complete', '', 48, 0, 0, CURRENT_TIMESTAMP),
  (1019, 'The', 858, 23, 'complete', '', 48, 0, 0, CURRENT_TIMESTAMP),
  (692, 'Optimus Noel', 834, 22, 'complete', '', 46, 0, 0, CURRENT_TIMESTAMP),
  (1018, 'NoeleoBot', 802, 22, 'complete', '', 46, 0, 0, CURRENT_TIMESTAMP),
  (1043, 'The Destroyer', 794, 22, 'complete', '', 46, 0, 0, CURRENT_TIMESTAMP),
  (1025, 'Noelinator', 786, 22, 'complete', '', 46, 0, 0, CURRENT_TIMESTAMP),
  (2608, 'drwrchrds v2', 775, 22, 'complete', '', 46, 0, 0, CURRENT_TIMESTAMP),
  (1042, 'NoelPointer', 668, 20, 'complete', '', 42, 0, 0, CURRENT_TIMESTAMP),
  (2401, 'ukilon', 658, 20, 'complete', '', 42, 0, 0, CURRENT_TIMESTAMP),
  (2874, 'tomgsmith99', 652, 20, 'complete', '', 42, 0, 0, CURRENT_TIMESTAMP);

