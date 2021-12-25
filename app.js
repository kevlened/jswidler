import ejs from 'ejs';
import express from 'express';
import {
  DB,
  nextChallengeId,
  createToken,
  createSecret,
  isLowercase,
} from './util.js';

const app = express();
app.engine('html', ejs.renderFile);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/resources', express.static('resources'));

app.get('/', (_, res) => res.redirect('/challenge'));
app.get('/challenge', (_, res) => res.render('challenge.html'));
app.get('/challenge/topscores', (_, res) => res.render('topscores.html'));
app.get('/challenge/webclient', (_, res) => res.render('webclient.html'));

app.post('/challenge', async (req, res) => {
  const db = await DB();

  const { solverName } = req.body;
  const challengeId = await nextChallengeId();
  const token = createToken();
  const startingSecretLength = 2;
  const allowedGuesses = 5000;

  await db.insertOne({
    createdAt: new Date(),
    solverName,
    challengeId,
    token,
    gameState: 'active',
    secret: createSecret(startingSecretLength),
    secretLength: startingSecretLength,
    guessesLeft: allowedGuesses,
    score: 0,
    level: 1,
    levelScore: 0
  });

  res.json({
    token,
    startingSecretLength,
    allowedGuesses,
    challengeId
  });
});

app.get('/challenge/topscorelist', async (_, res) => {
  const db = await DB();

  const topscorelist = [];
  await db.aggregate([
    { $match: { _id: { $ne: 'challengeIdCounter' } } },
    { $sort : { score: -1 } },
    {
      $group : {
        _id : "$solverName",
        challengeId: { $first : "$challengeId" },
        score: { $first : "$score" },
        level: { $first : "$level" },
      }
    }
  ])
  .limit(25)
  .forEach(c => topscorelist.push({
    solverName: c._id,
    challengeId: c.challengeId,
    score: c.score,
    level: c.level,
  }));

  res.json(topscorelist);
});

app.post('/challenge/guess', async (req, res) => {
  let error;
  if (!req.body) {
    error = 'Missing POST body.';
  } else if (!req.body.token) {
    error = "Need to provide a 'token'.";
  } else if (!req.body.guess) {
    error = "Need to provide a 'guess'.";
  }

  if (error) return res.status(400).json({ error });

  const { token, guess } = req.body;
  
  // find the challenge
  const db = await DB();
  let result = await db.findOneAndUpdate(
    { token },
    { $set: { token: createToken() } },
    { returnDocument: 'after' }
  );
  const challenge = result?.value;

  console.log('POST', '/challenge/guess', JSON.stringify(req.body), JSON.stringify(challenge));

  if (!challenge) {
    return res.status(404).json({
      error: 'Could not find a matching game in progress.'
    });
  }

  if (!challenge.guessesLeft) {
    return res.status(400).json({
      error: 'No more guesses left, game is over.'
    });
  }

  if (guess.length !== challenge.secretLength) {
    return res.status(400).json({
      error: 'Guess does not match secret length.'
    });
  }

  if (!guess.match(isLowercase)) {
    return res.status(400).json({
      error: 'Guess must be all lowercase alphabetic characters.'
    });
  }

  let {
    _id,
    gameState,
    secret,
    secretLength,
    guessesLeft,
    score,
    level,
    levelScore
  } = challenge;

  let correct = 0;
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === secret[i]) correct++;
  }

  // if we've improved our score on this level
  if (correct > levelScore) {
    const previousLevel = level - 1;
    const upTo5 = Math.min(previousLevel, 5) * 2;
    const after5 = Math.max(previousLevel - 5, 0) * 4;
    const previousLevelSum = upTo5 + after5;
    levelScore = correct;
    score = previousLevelSum + levelScore;
  }
  
  // advance to next level if all correct
  let numberLettersCorrect = correct;
  if (correct == guess.length) {
    level++;
    numberLettersCorrect = 0;
    levelScore = 0;

    const inc = level <= 5 ? 2 : 4;
    secretLength = secretLength + inc;
    secret = createSecret(secretLength);
  }

  // calculate remaining guesses
  guessesLeft -= 1;
  if (!guessesLeft) {
    token = null;
    gameState = 'complete';
  }
  
  await db.findOneAndUpdate(
    { _id },
    {
      $set: {
        gameState,
        secret,
        secretLength,
        guessesLeft,
        score,
        level,
        levelScore
      }
    }
  );

  res.json({
    token: challenge.token,
    numberLettersCorrect,
    level,
    secretLength,
    guessesLeft
  });
});

app.get('/challenge/:id', async (req, res) => {
  const db = await DB();
  const challenge = await db.findOne({ challengeId: req.params.id }, {
    projection: {
      _id: 0,
      challengeId: 1,
      score: 1,
      gameState: 1,
      guessesMade: 1,
      guessesLeft: 1,
      level: 1,
      secretLength: 1
    }
  });
  res.json(challenge);
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Started on port ${PORT}`));

export default app;
