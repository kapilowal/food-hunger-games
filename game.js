let players = [];
let alivePlayers = [];
let downPlayers = [];
let availableFoods = [];
let round = 1;
let gameRunning = false;

let eventMemory = [];
let hiddenEliminations = [];

let typingTimeout = null;
let cursorInterval = null;

const TYPE_SPEED = 50;
const POST_ROUND_PAUSE = 4000;

// ─────────────────────────────
// Utilities
// ─────────────────────────────
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─────────────────────────────
// UI helpers
// ─────────────────────────────
const playerInput = document.getElementById("playerName");
const addPlayerBtn = document.getElementById("addPlayerBtn");
const startGameBtn = document.getElementById("startGameBtn");
const resetGameBtn = document.getElementById("resetGameBtn");
const playerList = document.getElementById("playerList");
const gameLog = document.getElementById("gameLog");

function renderPlayers() {
  playerList.innerHTML = "";
  players.forEach(p => {
    const li = document.createElement("li");
    li.textContent = p.name;
    playerList.appendChild(li);
  });
}

function startCursor() {
  stopCursor();
  let visible = true;
  cursorInterval = setInterval(() => {
    const cursor = visible ? "▮" : "&nbsp;";
    visible = !visible;
    gameLog.innerHTML = gameLog.innerHTML.replace(/▮|&nbsp;$/, "") + cursor;
  }, 600);
}

function stopCursor() {
  if (cursorInterval) clearInterval(cursorInterval);
  cursorInterval = null;
}

function renderTransmission(text, speed = TYPE_SPEED, onComplete = () => {}) {
  if (typingTimeout) clearTimeout(typingTimeout);
  stopCursor();
  gameLog.innerHTML = "";
  let i = 0;

  function type() {
    if (i < text.length) {
      gameLog.innerHTML += text[i] === "\n" ? "<br>" : text[i];
      i++;
      typingTimeout = setTimeout(type, speed);
    } else {
      startCursor();
      onComplete();
    }
  }
  type();
}

// ─────────────────────────────
// Setup
// ─────────────────────────────
addPlayerBtn.addEventListener("click", () => {
  if (gameRunning) return;
  const name = playerInput.value.trim();
  if (!name) return;
  players.push({ name, status: "alive" });
  playerInput.value = "";
  renderPlayers();
});

startGameBtn.addEventListener("click", startGame);
resetGameBtn.addEventListener("click", resetGame);

function startGame() {
  if (players.length < 2 || gameRunning) return;

  gameRunning = true;
  round = 1;
  alivePlayers = players.map(p => ({ ...p, status: "alive" }));
  downPlayers = [];
  availableFoods = [...FOODS];
  eventMemory = [];
  hiddenEliminations = [];

  renderTransmission(
`📡 GLOBAL STREET BROADCAST

Multiple feeds detected.
Food shortages reported.
Information unreliable.

>> TRANSMISSION ACTIVE`,
TYPE_SPEED,
() => setTimeout(runRound, 2000)
  );
}

// ─────────────────────────────
// Core round logic (WITH SUSPENSE)
// ─────────────────────────────
function runRound() {
  // 🏁 Final
  if (alivePlayers.length === 1 && downPlayers.length === 0) {
    const winner = alivePlayers[0];
    renderTransmission(
`🏁 FINAL FEED

The noise fades.
The streets empty.

${winner.name} remains.

🏆 WINNER: ${winner.name}`,
TYPE_SPEED
    );
    gameRunning = false;
    return;
  }

  let text = `⚔️ ROUND ${round}\n\n`;
  round++;

  // 🔍 Delayed reveal chance
  if (hiddenEliminations.length > 0 && Math.random() < 0.4) {
    const reveal = hiddenEliminations.shift();
    text +=
`📢 TRANSMISSION UPDATE

${reveal.description}

\n`;
  }

  // 💥 Possible comeback
  if (downPlayers.length > 0 && Math.random() < 0.4) {
    const returning = downPlayers.splice(
      Math.floor(Math.random() * downPlayers.length), 1
    )[0];
    returning.status = "alive";
    alivePlayers.push(returning);
    text += `${returning.name} reappears.\nNobody explains how.\n\n`;
  }

  if (availableFoods.length === 0) {
    availableFoods = [...FOODS];
  }

  // 1️⃣ Actor
  const actor = pick(alivePlayers);

  // 2️⃣ Food
  const food = availableFoods.splice(
    Math.floor(Math.random() * availableFoods.length), 1
  )[0];

  const foodText = `${food.emoji} ${food.name} (${food.country})`;
  const logic =
    COUNTRY_LOGIC[food.country] || COUNTRY_LOGIC["Unknown"];

  text += generateEvent(actor.name, foodText);
  text += `\n${pick(logic.setup)}\n${pick(logic.pressure)}\n${pick(logic.mistake)}\n`;

  // 3️⃣ Outcome
  const roll = Math.random();

  function pickAffected() {
    if (alivePlayers.length === 1) return actor;
    return Math.random() < 0.6
      ? actor
      : pick(alivePlayers.filter(p => p !== actor));
  }

  if (roll < 0.35) {
    text += `\nNothing breaks.\nEveryone disperses.\n`;
  }
  else if (roll < 0.65 && alivePlayers.length > 2) {
    const affected = pickAffected();
    affected.status = "down";
    downPlayers.push(affected);
    alivePlayers = alivePlayers.filter(p => p !== affected);
    text += `\n${affected.name} goes down.\nNo confirmation.\n`;
  }
  else {
    const affected = pickAffected();
    affected.status = "dead";
    alivePlayers = alivePlayers.filter(p => p !== affected);

    const description =
`${affected.name} was eliminated
near a street stall
over ${food.name}.`;

    if (affected === actor) {
      text += `\n${affected.name} is eliminated.\n`;
    } else {
      hiddenEliminations.push({ name: affected.name, description });
      text += `\nSomeone disappears.\nNo signal follows.\n`;
    }
  }

  text +=
`\nALIVE: ${alivePlayers.map(p => p.name).join(", ") || "NONE"}
DOWN: ${downPlayers.map(p => p.name).join(", ") || "NONE"}`;

  renderTransmission(text, TYPE_SPEED, () => {
    setTimeout(runRound, POST_ROUND_PAUSE);
  });
}

// ─────────────────────────────
// Reset
// ─────────────────────────────
function resetGame() {
  players = [];
  alivePlayers = [];
  downPlayers = [];
  availableFoods = [];
  eventMemory = [];
  hiddenEliminations = [];
  round = 1;
  gameRunning = false;

  stopCursor();
  if (typingTimeout) clearTimeout(typingTimeout);

  playerList.innerHTML = "";
  gameLog.innerHTML = "";
  playerInput.value = "";
}
