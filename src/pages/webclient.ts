import { html } from "hono/html"

export default html`
<html>
<title>Coding Challenge Webclient</title>
<body>
  <script src="/resources/js/jquery-1.10.2.min.js"></script>
<div id="pageheader">
  <h1>Coding Challenge Webclient</h1>
</div>
<div id="body">
  
      

  <div id="messageDiv">
      <p><span id="message"></span></p>
  </div>

  <div id="errorDiv">
      <p><span id="error"></span> - <span id="errorDescription"></span></p>
  </div>

  <form id="guessForm">
      <input id="guess" name="guess" type="text"/>
      <input id="submit" type="submit" value="Guess"/>
  </form>

  <div id="instanceInfo">
      <p>Number of letters correct: <span id="numberLettersCorrect"></span></p>
      <p>Level: <span id="level"></span></p>
      <p>Secret Length: <span id="secretLength"></span></p>
      <p>Guesses Left: <span id="guessesLeft"></span> of <span id="maxGuesses"></span></p>
      <p>Current Token: <span id="token"></span></p>
      <p>Challenge ID: <span id="challengeId"></span></p>
  </div>

  <div>
      <a href="" onclick="viewSource();">Tip: View the source of this page</a>
  </div>


  
</div>
<div id="pagefooter">
  <p id="footer"></p>
</div>
</body>
</html>

<script type="text/javascript">
  $(function() {
      <!-- jQuery selectors -->
      var tokenSpan = $("#token"),
          levelSpan = $("#level"),
          challengeIdSpan = $("#challengeId"),
          secretLengthSpan = $("#secretLength"),
          guessesLeftSpan = $("#guessesLeft"),
          maxGuessesSpan = $("#maxGuesses"),
          guessInput = $("#guess"),
          numLettersCorrectSpan = $("#numberLettersCorrect"),
          messageDiv = $("#messageDiv"),
          messageSpan = $("#message"),
          errorSpan =$("#error"),
          errorDescriptionSpan =$("#errorDescription"),
          errorDiv = $("#errorDiv"),
          guessForm = $("#guessForm");

      <!-- Initialize page -->
      messageDiv.hide();
      errorDiv.hide();

      <!-- POST to /challenge the solverName then update page -->
      $.post("/challenge", {"solverName":"webclient"}, function(data) {
          tokenSpan.html(data.token);
          levelSpan.html(1);
          secretLengthSpan.html(data.startingSecretLength);
          guessesLeftSpan.html(data.allowedGuesses);
          maxGuessesSpan.html(data.allowedGuesses);
          numLettersCorrectSpan.html("0");
          challengeIdSpan.html(data.challengeId);
      }, 'json').fail(handleError);

      <!-- On form submit, POST to /challenge/guess with body containing the token and guess, then update page -->
      guessForm.submit(function(){
          var postArgs = {};
          postArgs.token = tokenSpan.text();
          postArgs.guess = guessInput.val();

          $.post("/challenge/guess", postArgs, function(data) {
              messageDiv.show();
              tokenSpan.html(data.token);
              numLettersCorrectSpan.html(data.numberLettersCorrect);
              levelSpan.html(data.level);
              secretLengthSpan.html(data.secretLength);
              guessesLeftSpan.html(data.guessesLeft);
              messageSpan.html(data.message);
              errorDiv.hide();
          }, 'json').fail(handleError);

          return false;
      });

      <!-- Handle error responses -->
      function handleError(response) {
          messageDiv.hide();
          errorDiv.show();
          if (response.responseJSON && response.responseJSON.error) {
              errorSpan.html(response.responseJSON.error);
              errorDescriptionSpan.html(response.responseJSON.errorDescription);
          } else if (response.status == 0) {
              errorSpan.html("Error");
              errorDescriptionSpan.html("The server did not respond to the request");
          } else {
              errorSpan.html("Error " + response.status);
              errorDescriptionSpan.html(response.statusText);
          }
      }
  });

  var viewSource = function viewSource() {
      var win=window.open("view-source:" + location.href, '_blank');
      win.focus();
      return;
  }
</script>
`
