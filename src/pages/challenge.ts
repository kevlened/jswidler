import { html } from "hono/html";

export default html`
<html>
<title>Coding Challenge Instructions</title>
<body>

<div id="pageheader">
    <h1>Coding Challenge Instructions</h1>
</div>
<div id="body">
    
        
    <p>
        The challenge will require you to play a game against a computer that is keeping a secret random string hidden
        from you.  Each time you correctly guess a complete string, you will advance to the next level, and the computer
        will make the new secret longer and more tricky to guess.
    </p>

    <p>
        In order to help you narrow down the hidden string, you will be given a hint based on your last guess.  The hint
        you will receive will tell you how many characters you guessed correctly in the last attempt.  For example, if
        the computer is hiding the secret "juoaps" and you provide the guess "uokaps", the hint will show that you got 3
        letters correct, since the letters 'aps' appear in the same location of both strings.
    </p>

    <p>
        The game is played through a simple interface over http.  The responses will be in JSON.  You are limited to
        5000 guesses per game.  Each of your requests should be used wisely in an effort to gain as much information as
        possible from the hint.  You may only use the characters a-z to make your guesses.  These are the only characters
        which will appear in the secret string.

        The final score will reflect how many characters you were ultimately able to get correct on your best guess,
        including the characters on levels you were able to beat.
    </p>

    <p>
        <a href="/challenge/webclient">There is a simple human powered webclient if you follow this link</a>
    </p>

    <p>
        To play the game, start a new one by performing a POST to <b>https://jswidler.co/challenge</b>.   All subsequent
        requests for the game should be a POST to <b>https://jswidler.co/challenge/guess</b>.  In each response, you will
        receive a <b>token</b> in addition to some information about the game.  The token is one time use and thus ensures your
        solution should be single threaded.  All your requests to the guess url should include your most recent <b>token</b>
        along with your <b>guess</b>.
    </p>

    <p>
        When starting a new game, you must provide a <b>solverName</b>, which will appear on the high list along with the best
        score from all your attempts.  You will also get a challengeId when starting a new game.  This ID is only for
        reference purposes, it cannot be  used to play the game.  You can view the results of any game by going to
        <b>https://jswidler.co/challenge/{challengeId}</b>.
    </p>
    <p>
        You can view the top scores for each solver at <a href="/challenge/topscores">challenge/topscores</a>
    </p>
</div>
<div id="pagefooter">
    <p id="footer"></p>
</div>
</body>
</html>
`;
