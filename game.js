let players = [];
let alivePlayers = [];
let downPlayers = [];
let availableFoods = [];
let round = 1;
let gameRunning = false;

let typingTimeout = null;

const TYPE_SPEED = 40;
const POST_ROUND_PAUSE = 4000;

const playerInput = document.getElementById("playerName");
const startGameBtn = document.getElementById("startGameBtn");
const resetGameBtn = document.getElementById("resetGameBtn");
const playerList = document.getElementById("playerList");
const gameLog = document.getElementById("gameLog");

/* UTIL */
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ENTER KEY ADD */
playerInput.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  if (gameRunning) return;

  const name = playerInput.value.trim();
  if (!name) return;

  if (players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
    playerInput.value = "";
    return;
  }

  players.push({
    name,
    status: "alive",
    joinedRound: 1,
    eliminatedRound: null,
    foodHistory: []
  });

  playerInput.value = "";
  renderPlayers();
});

/* UI */
function renderPlayers() {
  playerList.innerHTML = "";
  players.forEach(p => {
    const li = document.createElement("li");
    li.textContent = p.name;
    playerList.appendChild(li);
  });
}

startGameBtn.onclick = startGame;
resetGameBtn.onclick = resetGame;

/* TYPEWRITER */
function renderTransmission(text, speed = TYPE_SPEED, onComplete = () => {}) {
  clearTimeout(typingTimeout);
  gameLog.innerHTML = "";
  let i = 0;

  function type() {
    if (i < text.length) {
      gameLog.innerHTML += text[i] === "\n" ? "<br>" : text[i];
      i++;
      typingTimeout = setTimeout(type, speed);
    } else {
      onComplete();
    }
  }
  type();
}

/* GAME START */
function startGame() {
  if (players.length < 2) return;

  gameRunning = true;
  round = 1;
  alivePlayers = players.map(p => ({ ...p, foodHistory: [] }));
  downPlayers = [];
  availableFoods = [...FOODS];

  renderTransmission(
`GLOBAL STREET BROADCAST
Multiple feeds detected.
Information unreliable.
TRANSMISSION ACTIVE.`,
TYPE_SPEED,
() => setTimeout(runRound, 2000)
  );
}

/* CORE GAME LOOP */
function runRound() {
  if (alivePlayers.length === 0 && downPlayers.length > 0) {
    const revived = downPlayers.shift();
    revived.status = "alive";
    alivePlayers.push(revived);

    renderTransmission(
`${revived.name} was never confirmed dead.
Signal stabilizes.`,
TYPE_SPEED,
() => setTimeout(runRound, 2000)
    );
    return;
  }

  if (alivePlayers.length === 1 && downPlayers.length === 0) {
    showFinalGrid();
    return;
  }

  let text = `ROUND ${round}\n`;
  round++;

  if (availableFoods.length === 0) availableFoods = [...FOODS];

  const actor = pick(alivePlayers);
  const food = pick(availableFoods);
  const foodText = `${food.emoji} ${food.name}`;

  actor.foodHistory.push(foodText);
  text += `\n${generateEvent(actor.name, foodText)}\n`;

  const aliveCount = alivePlayers.length;
  let outcome;

  if (aliveCount <= 2) {
    outcome = "ELIMINATION";
  } else {
    const roll = Math.random();
    if (roll < 0.3) outcome = "SAFE";
    else if (roll < 0.6) outcome = "DOWN";
    else outcome = "ELIMINATION";
  }

  function pickAffected() {
    if (alivePlayers.length === 1) return actor;
    return pick(alivePlayers.filter(p => p !== actor));
  }

  if (outcome === "SAFE") {
    text += `\nNothing serious happened.`;
  }

  if (outcome === "DOWN") {
    const affected = pickAffected();
    affected.status = "down";
    downPlayers.push(affected);
    alivePlayers = alivePlayers.filter(p => p !== affected);
    text += `\n${affected.name} went down.`;
  }

  if (outcome === "ELIMINATION") {
    const affected = pickAffected();
    affected.status = "dead";
    affected.eliminatedRound = round - 1;
    alivePlayers = alivePlayers.filter(p => p !== affected);
    text += `\n${affected.name} was eliminated.`;
  }

  renderTransmission(text, TYPE_SPEED, () => {
    setTimeout(runRound, POST_ROUND_PAUSE);
  });
}

/* FINAL GRID */
function showFinalGrid() {
  const totalRounds = round - 1;
  const winner = alivePlayers[0];

  let html = `<strong>FINAL TRANSMISSION</strong><br>Total Rounds: ${totalRounds}<br><br>`;
  html += `<div class="final-grid">`;

  players.forEach(p => {
    const survived = p.eliminatedRound
      ? p.eliminatedRound - p.joinedRound + 1
      : totalRounds;

    const foods =
      p.foodHistory.length > 4
        ? `${p.foodHistory.slice(0, 2).join(" → ")} → … → ${p.foodHistory.slice(-2).join(" → ")}`
        : p.foodHistory.join(" → ");

    html += `
      <div class="player-card ${p === winner ? "winner" : ""}">
        <div><strong>${p === winner ? "🎉✨🥳 " : ""}${p.name}</strong></div>
        <div>Rounds: ${survived}</div>
        <div>Food: ${foods || "None"}</div>
      </div>
    `;
  });

  html += `</div>`;
  gameLog.innerHTML = html;
  gameRunning = false;
}

/* RESET */
function resetGame() {
  players = [];
  alivePlayers = [];
  downPlayers = [];
  availableFoods = [];
  round = 1;
  gameRunning = false;

  clearTimeout(typingTimeout);
  playerList.innerHTML = "";
  gameLog.innerHTML = "";
}
