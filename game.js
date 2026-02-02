let players = [];
let alivePlayers = [];

const playerInput = document.getElementById("playerName");
const addPlayerBtn = document.getElementById("addPlayerBtn");
const startGameBtn = document.getElementById("startGameBtn");
const playerList = document.getElementById("playerList");
const gameLog = document.getElementById("gameLog");

addPlayerBtn.addEventListener("click", () => {
  const name = playerInput.value.trim();
  if (!name) return;

  players.push({ name });
  playerInput.value = "";
  renderPlayers();
});

startGameBtn.addEventListener("click", startGame);

function renderPlayers() {
  playerList.innerHTML = "";
  players.forEach(p => {
    const li = document.createElement("li");
    li.textContent = p.name;
    playerList.appendChild(li);
  });
}

function log(message) {
  const p = document.createElement("p");
  p.textContent = message;
  gameLog.appendChild(p);
}

function startGame() {
  if (players.length < 2) {
    alert("Need at least 2 players!");
    return;
  }

  alivePlayers = [...players];
  log("🔥 The Food Hunger Games begin!");

  runRound();
}

function runRound() {
  if (alivePlayers.length === 1) {
    log(`🏆 WINNER: ${alivePlayers[0].name}`);
    return;
  }

  setTimeout(() => {
    const loserIndex = Math.floor(Math.random() * alivePlayers.length);
    const loser = alivePlayers.splice(loserIndex, 1)[0];

    const food = FOODS[Math.floor(Math.random() * FOODS.length)];
    const event = EVENTS[Math.floor(Math.random() * EVENTS.length)];

    log(event.replace("{loser}", loser.name).replace("{food}", food));

    runRound();
  }, 2000);
}
