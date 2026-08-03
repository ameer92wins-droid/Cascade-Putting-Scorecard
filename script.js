const holes = [
    { number: 1, par: 4 },
    { number: 2, par: 4 },
    { number: 3, par: 4 },
    { number: 4, par: 3 },
    { number: 5, par: 3 },
    { number: 6, par: 4 },
    { number: 7, par: 3 },
    { number: 8, par: 4 },
    { number: 9, par: 3 },
    { number: 10, par: 3 },
    { number: 11, par: 4 },
    { number: 12, par: 4 },
    { number: 13, par: 3 },
    { number: 14, par: 4 },
    { number: 15, par: 4 },
    { number: 16, par: 4 },
    { number: 17, par: 4 },
    { number: 18, par: 5 }
];

let playerCount = 2;
let winnerPopupShown = false;

const totalPar = holes.reduce(
    (sum, hole) => sum + hole.par,
    0
);

const startupScreen =
    document.getElementById("startup-screen");

const gameScreen =
    document.getElementById("game-screen");

const playerCountSelect =
    document.getElementById("player-count");

const startGameButton =
    document.getElementById("start-game-btn");

const startOverButton =
    document.getElementById("start-over-btn");

const tableHead =
    document.getElementById("table-head");

const scorecard =
    document.getElementById("scorecard");

const tableFoot =
    document.getElementById("table-foot");


startGameButton.addEventListener("click", startGame);

startOverButton.addEventListener("click", startOver);

document.addEventListener("input", function (event) {
    if (event.target.classList.contains("score")) {
        validateScore(event.target);
        calculateScores();
    }
});


function startGame() {
    playerCount = Number(playerCountSelect.value);

    winnerPopupShown = false;

    startupScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");

    buildScorecard();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function startOver() {
    const confirmed = window.confirm(
        "Start over? All current scores will be erased."
    );

    if (!confirmed) {
        return;
    }

    closeWinnerPopup();

    winnerPopupShown = false;

    tableHead.innerHTML = "";
    scorecard.innerHTML = "";
    tableFoot.innerHTML = "";

    gameScreen.classList.add("hidden");
    startupScreen.classList.remove("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function buildScorecard() {
    buildHeader();
    buildHoleRows();
    buildTotalsRow();
}


function buildHeader() {
    let headerHTML = `
        <tr>
            <th class="small-col">Hole</th>
            <th class="small-col">Par</th>
    `;

    for (let player = 0; player < playerCount; player++) {
        headerHTML += `
            <th>
                <input
                    type="text"
                    value="Player ${player + 1}"
                    class="name-input"
                    data-name-player="${player}"
                    aria-label="Player ${player + 1} name"
                >
            </th>
        `;
    }

    headerHTML += `</tr>`;

    tableHead.innerHTML = headerHTML;
}


function buildHoleRows() {
    scorecard.innerHTML = "";

    holes.forEach((hole, holeIndex) => {
        const row = document.createElement("tr");

        let rowHTML = `
            <td class="small-col hole-number">
                ${hole.number}
            </td>

            <td class="small-col par-number">
                ${hole.par}
            </td>
        `;

        for (let player = 0; player < playerCount; player++) {
            rowHTML += `
                <td>
                    <input
                        type="number"
                        min="1"
                        max="6"
                        inputmode="numeric"
                        class="score"
                        data-player="${player}"
                        data-hole="${holeIndex}"
                        aria-label="Player ${player + 1}, hole ${hole.number}"
                    >

                    <div
                        class="status"
                        id="status-${holeIndex}-${player}"
                    ></div>
                </td>
            `;
        }

        row.innerHTML = rowHTML;
        scorecard.appendChild(row);
    });
}


function buildTotalsRow() {
    let footerHTML = `
        <tr>
            <td class="small-col">
                <strong>Total</strong>
            </td>

            <td class="small-col">
                <strong>—</strong>
            </td>
    `;

    for (let player = 0; player < playerCount; player++) {
        footerHTML += `
            <td>
                <strong
                    id="total-${player}"
                    class="final-total"
                >
                    0
                </strong>
            </td>
        `;
    }

    footerHTML += `</tr>`;

    tableFoot.innerHTML = footerHTML;
}


function validateScore(input) {
    if (input.value === "") {
        return;
    }

    let score = Number(input.value);

    if (score < 1) {
        score = 1;
    }

    if (score > 6) {
        score = 6;
    }

    input.value = score;
}


function calculateScores() {
    for (let player = 0; player < playerCount; player++) {
        let playerTotal = 0;
        let runningPar = 0;

        holes.forEach((hole, holeIndex) => {
            const input = document.querySelector(
                `[data-player="${player}"][data-hole="${holeIndex}"]`
            );

            const status = document.getElementById(
                `status-${holeIndex}-${player}`
            );

            if (!input || !status) {
                return;
            }

            if (input.value !== "") {
                const score = Number(input.value);

                playerTotal += score;
                runningPar += hole.par;

                const runningDifference =
                    playerTotal - runningPar;

                status.textContent =
                    formatOverUnder(runningDifference);

                applyDifferenceColor(
                    status,
                    runningDifference
                );
            } else {
                status.textContent = "";

                status.classList.remove(
                    "under-par",
                    "even-par",
                    "over-par"
                );
            }
        });

        const totalElement =
            document.getElementById(`total-${player}`);

        totalElement.textContent = playerTotal;

        const completedPlayer =
            hasPlayerFinished(player);

        if (completedPlayer) {
            const finalDifference =
                playerTotal - totalPar;

            applyDifferenceColor(
                totalElement,
                finalDifference
            );
        } else {
            totalElement.classList.remove(
                "under-par",
                "even-par",
                "over-par"
            );
        }
    }

    checkForWinner();
}


function hasPlayerFinished(player) {
    const playerScores = document.querySelectorAll(
        `.score[data-player="${player}"]`
    );

    return Array.from(playerScores).every(
        input => input.value !== ""
    );
}


function formatOverUnder(difference) {
    if (difference === 0) {
        return "E";
    }

    if (difference > 0) {
        return `+${difference}`;
    }

    return `${difference}`;
}


function applyDifferenceColor(element, difference) {
    element.classList.remove(
        "under-par",
        "even-par",
        "over-par"
    );

    if (difference < 0) {
        element.classList.add("under-par");
    } else if (difference === 0) {
        element.classList.add("even-par");
    } else {
        element.classList.add("over-par");
    }
}


function checkForWinner() {
    const allScores =
        document.querySelectorAll(".score");

    const everyScoreCompleted =
        Array.from(allScores).every(
            input => input.value !== ""
        );

    if (!everyScoreCompleted || winnerPopupShown) {
        return;
    }

    const totals = [];

    for (let player = 0; player < playerCount; player++) {
        const total = Number(
            document.getElementById(
                `total-${player}`
            ).textContent
        );

        totals.push(total);
    }

    const winningScore = Math.min(...totals);

    const winningPlayers = [];

    totals.forEach((total, playerIndex) => {
        if (total === winningScore) {
            winningPlayers.push(playerIndex);
        }
    });

    const nameInputs =
        document.querySelectorAll(".name-input");

    let winnerMessage;

    if (winningPlayers.length === 1) {
        const winnerIndex = winningPlayers[0];

        const winnerName =
            nameInputs[winnerIndex].value.trim() ||
            `Player ${winnerIndex + 1}`;

        winnerMessage =
            `Congratulations ${winnerName} for shooting the lowest score, ${winningScore}!`;
    } else {
        const winnerNames = winningPlayers.map(
            winnerIndex =>
                nameInputs[winnerIndex].value.trim() ||
                `Player ${winnerIndex + 1}`
        );

        winnerMessage =
            `It's a tie! Congratulations ${winnerNames.join(
                " and "
            )} for shooting the lowest score, ${winningScore}!`;
    }

    document.getElementById(
        "winner-message"
    ).textContent = winnerMessage;

    document.getElementById(
        "winner-popup"
    ).style.display = "flex";

    winnerPopupShown = true;
}


function closeWinnerPopup() {
    document.getElementById(
        "winner-popup"
    ).style.display = "none";
}


function openRules() {
    document.getElementById(
        "rules-popup"
    ).style.display = "flex";
}


function closeRules() {
    document.getElementById(
        "rules-popup"
    ).style.display = "none";
}


window.addEventListener("click", function (event) {
    const rulesPopup =
        document.getElementById("rules-popup");

    const winnerPopup =
        document.getElementById("winner-popup");

    if (event.target === rulesPopup) {
        closeRules();
    }

    if (event.target === winnerPopup) {
        closeWinnerPopup();
    }
});
