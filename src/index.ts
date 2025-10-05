import { Hono } from 'hono'
import challenge from './pages/challenge'
import topscores from './pages/topscores'
import webclient from './pages/webclient'

// Add D1 type to the Bindings
type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/challenge', (c) => c.html(challenge))
app.get('/challenge/topscores', (c) => c.html(topscores))
app.get('/challenge/webclient', (c) => c.html(webclient))

app.get('/', async (c) => {
  return c.redirect('/challenge')
})

app.get('/challenge/topscorelist', async (c) => {
  const query = `
    SELECT challengeId, solverName, score, level
    FROM challenges
    ORDER BY score DESC
    LIMIT 25
  `;

  const results = await c.env.DB.prepare(query).all();
  return c.json(results.results);
})

// New route to fetch a challenge by id using SQLite queries
app.get('/challenge/:id', async (c) => {
  // Retrieve the 'id' from URL parameters
  const idParam = c.req.param('id')
  const challengeId = parseInt(idParam)
  
  if (Number.isNaN(challengeId)) {
    return c.json({ error: 'Invalid challenge id' }, 400)
  }
  
  // Prepare the SQLite query to select the challenge record
  const sqlQuery = `
    SELECT
      challengeId,
      score,
      gameState,
      guessesLeft,
      level,
      secretLength
    FROM challenges
    WHERE challengeId = ?
  `;
  
  // Execute the query, bind the challengeId, then retrieve the first row
  const challenge = await c.env.DB.prepare(sqlQuery)
                          .bind(challengeId)
                          .first();
  
  if (!challenge) {
    return c.json({ error: 'Challenge not found' }, 404)
  }
  
  return c.json({
    challengeId: challenge.challengeId,
    score: challenge.score,
    gameState: challenge.gameState,
    guessesMade: 5000 - (challenge.guessesLeft as unknown as number),
    guessesLeft: challenge.guessesLeft,
    level: challenge.level,
    secretLength: challenge.secretLength
  })
})


function createToken(): string {
  return Math.random().toString(36).substring(2);
}

function createSecret(length: number): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  const values = new Uint8Array(length);
  crypto.getRandomValues(values);
  
  let result = '';
  for (let i = 0; i < length; i++) {
    result += alphabet.charAt(values[i] % alphabet.length);
  }
  return result;
}

const isLowercase = /^[a-z]+$/;

// Add this function near the other utility functions
async function getNextChallengeId(db: D1Database): Promise<number> {
  const result = await db.prepare(
    'SELECT MAX(challengeId) as maxId FROM challenges'
  ).first<{ maxId: number }>();
  
  return (result?.maxId || 0) + 1;
}

// Add the new route
app.post('/challenge', async (c) => {
  // accept a form or json body
  let solverName: string | null = null;

  // get the content-type
  const contentType = c.req.header('content-type')
  if (contentType === 'application/json') {
    const jsonBody = await c.req.json()
    solverName = jsonBody.solverName || null;
  } else {
    const formData = await c.req.formData();
    solverName = formData.get('solverName')?.toString() || null;
  }

  if (!solverName) {
    return c.json({ error: "Need to provide a 'solverName'." }, 400);
  }

  const challengeId = await getNextChallengeId(c.env.DB);
  const token = createToken();
  const startingSecretLength = 2;
  const allowedGuesses = 5000;
  const secret = createSecret(startingSecretLength);

  const insertQuery = `
    INSERT INTO challenges (
      solverName,
      challengeId,
      token,
      gameState,
      secret,
      secretLength,
      guessesLeft,
      score,
      level,
      levelScore,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `;

  await c.env.DB.prepare(insertQuery)
    .bind(
      solverName,
      challengeId,
      token,
      'active',
      secret,
      startingSecretLength,
      allowedGuesses,
      0, // score
      1, // level
      0  // levelScore
    )
    .run();

  return c.json({
    token,
    startingSecretLength,
    allowedGuesses,
    challengeId
  });
});

// Add the new route
app.post('/challenge/guess', async (c) => {
  // Try to parse as form data first, then fall back to JSON
  let token: string | null = null;
  let guess: string | null = null;

  const contentType = c.req.header('content-type');
  if (contentType === 'application/json') {
    const jsonBody = await c.req.json();
    if (!jsonBody) {
      return c.json({ error: 'Missing POST body.' }, 400);
    }
    token = jsonBody.token || null;
    guess = jsonBody.guess || null;
  } else {
    const formData = await c.req.formData();
    if (!formData) {
      return c.json({ error: 'Missing POST body.' }, 400);
    }
    token = formData.get('token')?.toString() || null;
    guess = formData.get('guess')?.toString() || null;
  }
  
  if (!token) {
    return c.json({ error: "Need to provide a 'token'." }, 400);
  }
  if (!guess) {
    return c.json({ error: "Need to provide a 'guess'." }, 400);
  }

  // Find the challenge
  const sqlQuery = `
    SELECT *
    FROM challenges 
    WHERE token = ?
  `;
  
  const challenge = await c.env.DB.prepare(sqlQuery)
    .bind(token)
    .first();

  if (!challenge) {
    return c.json({
      error: 'Could not find a matching game in progress.'
    }, 404);
  }

  if ((challenge.guessesLeft as number) <= 0) {
    return c.json({
      error: 'No more guesses left, game is over.'
    }, 400);
  }

  if (guess.length !== challenge.secretLength) {
    return c.json({
      error: 'Guess does not match secret length.'
    }, 400);
  }

  if (!guess.match(isLowercase)) {
    return c.json({
      error: 'Guess must be all lowercase alphabetic characters.'
    }, 400);
  }

  // Only get new token after all validation passes
  const newToken = createToken();
  const updateTokenQuery = `
    UPDATE challenges 
    SET token = ?
    WHERE token = ?
  `;

  await c.env.DB.prepare(updateTokenQuery)
    .bind(newToken, token)
    .run();

  let {
    challengeId,
    gameState,
    secret,
    secretLength,
    guessesLeft,
    score,
    level,
    levelScore
  } = challenge as {
    challengeId: number;
    gameState: string;
    secret: string;
    secretLength: number;
    guessesLeft: number;
    score: number;
    level: number;
    levelScore: number;
  };

  // Ensure levelScore has a valid value
  levelScore = levelScore ?? 0;

  // Calculate correct letters
  let correct = 0;
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === secret[i]) correct++;
  }

  // Update score if improved
  if (correct > levelScore) {
    const previousLevel = level - 1;
    const upTo5 = Math.min(previousLevel, 4) * 2;
    const after5 = Math.max(previousLevel - 4, 0) * 4;
    const previousLevelSum = upTo5 + after5;
    levelScore = correct;
    score = previousLevelSum + levelScore;
  }

  // Handle level advancement
  let numberLettersCorrect = correct;
  if (correct === guess.length) {
    level++;
    numberLettersCorrect = 0;
    levelScore = 0;

    const inc = level <= 4 ? 2 : 4;
    secretLength = secretLength + inc;
    secret = createSecret(secretLength);
  }

  // Update guesses and game state
  guessesLeft -= 1;
  if (guessesLeft <= 0) {
    gameState = 'complete';
  }

  // Update the challenge in the database
  const updateQuery = `
    UPDATE challenges
    SET 
      gameState = ?,
      secret = ?,
      secretLength = ?,
      guessesLeft = ?,
      score = ?,
      level = ?,
      levelScore = ?
    WHERE challengeId = ?
  `;

  await c.env.DB.prepare(updateQuery)
    .bind(
      gameState,
      secret,
      secretLength,
      guessesLeft,
      score,
      level,
      levelScore,
      challengeId
    )
    .run();

  return c.json({
    token: newToken,
    numberLettersCorrect,
    level,
    secretLength,
    guessesLeft,

    // I don't think was in the original version
    score,
  });
});

export default app
