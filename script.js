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
const maxPlayers = 6;

const tableHead = document.getElementById("table-head");
const scorecard = document.getElementById("scorecard");
const tableFoot = document.getElementById("table-foot");
const addPlayerBtn = document.getElementById("add-player-btn");

const totalPar = holes.reduce((sum, hole) => sum + hole.par, 0);

let winnerPopupShown = false;

addPlayerBtn.addEventListener("click", function () {
    if (playerCount < maxPlayers) {
        playerCount++;
        winnerPopupShown = false;
        buildTable();
    }

    if (playerCount === maxPlayers) {
        addPlayerBtn.disabled = true;
        addPlayerBtn.textContent = "Max Players Reached";
    }
});

function formatOverUnder(diff) {
    if (diff === 0) return "±0";
    if (diff > 0) return `+${diff}`;
    return `${diff}`;
}

function buildHeader() {
    let headerHTML = `
        <tr>
            <th class="small-col">Hole</th>
            <th class="small-col">Par</th>
    `;

    for (let p = 0; p < playerCount; p++) {
        headerHTML += `
            <th>
                <input type="text" value="Player ${p + 1}" class="name-input">
            </th>
        `;
    }

    headerHTML += `</tr>`;
    tableHead.innerHTML = headerHTML;
}

function buildTable() {
    buildHeader();

    scorecard.innerHTML = "";

    holes.forEach((hole, holeIndex) => {
        const row = document.createElement("tr");

        let rowHTML = `
            <td class="small-col"><strong>${hole.number}</strong></td>
            <td class="small-col"><strong>${hole.par}</strong></td>
        `;

        for (let p = 0; p < playerCount; p++) {
            rowHTML += `
                <td>
                    <input
                        type="number"
                        min="1"
                        class="score"
                        data-player="${p}"
                        data-hole="${holeIndex}"
                    >
                    <div
                        class="status"
                        id="status-${holeIndex}-${p}">
                    </div>
                </td>
            `;
        }

        row.innerHTML = rowHTML;
        scorecard.appendChild(row);
    });

    buildTotalsRow();
}

function buildTotalsRow() {
    let footerHTML = `
        <tr>
            <td class="small-col"><strong>Total</strong></td>
            <td class="small-col"><strong>-</strong></td>
    `;

    for (let p = 0; p < playerCount; p++) {
        footerHTML += `
            <td>
                <strong id="total-${p}">0</strong>
            </td>
        `;
    }

    footerHTML += `</tr>`;
    tableFoot.innerHTML = footerHTML;
}

document.addEventListener("input", calculateScores);

function calculateScores() {
    for (let p = 0; p < playerCount; p++) {
        let playerTotal = 0;
        let runningPar = 0;

        holes.forEach((hole, h) => {
            const input = document.querySelector(
                `[data-player="${p}"][data-hole="${h}"]`
            );

            const score = Number(input.value) || 0;
            const status = document.getElementById(`status-${h}-${p}`);

            if (score > 0) {
                playerTotal += score;
                runningPar += hole.par;

                const runningDiff = playerTotal - runningPar;
                status.textContent = formatOverUnder(runningDiff);
            } else {
                status.textContent = "";
            }
        });

        const totalElement = document.getElementById(`total-${p}`);
        totalElement.textContent = playerTotal;

        if (playerTotal < totalPar) {
            totalElement.className = "under-par";
        }
        else if (playerTotal === totalPar) {
            totalElement.className = "even-par";
        }
        else {
            totalElement.className = "over-par";
        }
    }

    checkForWinner();
}

function checkForWinner() {
    const allScores = document.querySelectorAll(".score");

    for (let input of allScores) {
        if (input.value === "") {
            return;
        }
    }

    if (winnerPopupShown) {
        return;
    }

    let winnerIndex = 0;
    let winningScore = Infinity;

    for (let p = 0; p < playerCount; p++) {
        const total = Number(document.getElementById(`total-${p}`).textContent);

        if (total < winningScore) {
            winningScore = total;
            winnerIndex = p;
        }
    }

    const playerNames = document.querySelectorAll(".name-input");
    const winnerName = playerNames[winnerIndex].value || `Player ${winnerIndex + 1}`;

    document.getElementById("winner-message").textContent =
        `Congratulations ${winnerName} for shooting the lowest score, ${winningScore}! Thanks for playing!`;

    document.getElementById("winner-popup").style.display = "flex";
    winnerPopupShown = true;
}

function closeWinnerPopup() {
    document.getElementById("winner-popup").style.display = "none";
}

buildTable();