import { html } from "hono/html";

export default html`
<html>

<title>Challenge Top Scores</title>

<body>
<script src="/resources/js/jquery-1.10.2.min.js"></script>
<div id="pageheader">
    <h1>Challenge Top Scores</h1>
</div>
<div id="body">
    
        

    <div id="message">
        <p>
            Challenge yourself by trying to be the best!  Here are the past top scores.
        </p>

        <p>
            These scores are loaded from <a href="topscorelist">challenge/topscorelist</a>
        </p>
    </div>

    <div id="topScores">
        <table id="topScoreTable">
            <thead>
            <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Challenge ID</th>
                <th>Score</th>
                <th>Level</th>
            </tr>
            </thead>
            <tbody>
            <tr></tr>
            </tbody>
        </table>
    </div>


    
</div>
<div id="pagefooter">
    <p id="footer"></p>
</div>
</body>
</html>

<script type="text/javascript">
    $(function() {
        $.getJSON("topscorelist", function(data) {
            var tableBody = $("#topScoreTable tbody");
            var templateRow = tableBody.find("tr:first").clone();

            tableBody = tableBody[0];
            tableBody.innerHTML = "";
            templateRow[0].innerHTML = "";

            var node;
            for (var elem in data) {
                var currentRow = templateRow.clone()[0];
                var topScore = data[elem];

                node = document.createElement("th");
                node.innerText = (1+parseInt(elem)) + ".";
                currentRow.appendChild(node);

                node = document.createElement("td");
                node.innerText = topScore.solverName;
                currentRow.appendChild(node);

                node = document.createElement("td");
                node.innerHTML = buildLink(topScore.challengeId);
                currentRow.appendChild(node);

                node = document.createElement("td");
                node.innerText = topScore.score;
                currentRow.appendChild(node);

                node = document.createElement("td");
                node.innerText = topScore.level;
                currentRow.appendChild(node);

                tableBody.appendChild(currentRow);
            }
        });
    });

    var buildLink = function buildLink(id) {
        return '<a href="/challenge/'+id+'">'+id+'</a>';
    }
</script>
`;
