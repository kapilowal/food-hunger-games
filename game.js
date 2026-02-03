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
const addPlayerBtn = document.getElementById("addPlayerBtn");
const startGameBtn = document.getElementById("startGameBtn");
const resetGameBtn = document.getElementById("resetGameBtn");
const playerList = document.getElementById("playerList");
const gameLog = document.getElementById("gameLog");

/* UTIL */
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

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

/* UI */
addPlayerBtn.onclick = () => {
  if (gameRunning) return;
  const name = playerInput.value.trim();
  if (!name) return;

  players.push({
    name,
    status: "alive",
    joinedRound: 1,
    eliminatedRound: null,
    foodHistory: []   // 🆕 track foods per round
  });

  playerInput.value = "";
  renderPlayers();
};

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

/* GAME */
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

function runRound() {
  if (alivePlayers.length === 1 && downPlayers.length === 0) {
    showFinalStats();
    return;
  }

  let text = `ROUND ${round}\n`;
  round++;

  if (availableFoods.length === 0) {
    availableFoods = [...FOODS];
  }

  const actor = pick(alivePlayers);
  const food = pick(availableFoods);
  const foodText = `${food.emoji} ${food.name} (${food.country})`;

  // 🆕 Record food for the actor
  actor.foodHistory.push(foodText);

  text += `\n${generateEvent(actor.name, foodText)}\n`;

  const roll = Math.random();

  function pickAffected() {
    if (alivePlayers.length === 1) return actor;
    return Math.random() < 0.6
      ? actor
      : pick(alivePlayers.filter(p => p !== actor));
  }

  if (roll < 0.35) {
    text += `\nNothing serious happened. People dispersed and moved on.`;
  }
  else if (roll < 0.65 && alivePlayers.length > 2) {
    const affected = pickAffected();
    affected.status = "down";
    downPlayers.push(affected);
    alivePlayers = alivePlayers.filter(p => p !== affected);
    text += `\n${affected.name} went down. No clear confirmation followed.`;
  }
  else {
    const affected = pickAffected();
    affected.status = "dead";
    affected.eliminatedRound = round - 1;
    alivePlayers = alivePlayers.filter(p => p !== affected);
    text += `\n${affected.name} was eliminated. The feed cut shortly after.`;
  }

  text += `\n\nAlive: ${alivePlayers.map(p => p.name).join(", ") || "None"}
Down: ${downPlayers.map(p => p.name).join(", ") || "None"}`;

  renderTransmission(text, TYPE_SPEED, () => {
    setTimeout(runRound, POST_ROUND_PAUSE);
  });
}

/* FINAL STATS */
function showFinalStats() {
  const totalRounds = round - 1;
  let text = `FINAL TRANSMISSION\n\nTotal Rounds: ${totalRounds}\n`;

  players.forEach(p => {
    const survived =
      p.eliminatedRound
        ? p.eliminatedRound - p.joinedRound + 1
        : totalRounds;

    text += `\n${p.name} survived ${survived} rounds.`;

    if (p.foodHistory.length > 0) {
      text += `\nFood journey: ${p.foodHistory.join(" → ")}`;
    }
    text += "\n";
  });

  const winner = alivePlayers[0];
  text += `\n🎉✨🥳 WINNER: ${winner.name} 🥳✨🎉`;

  renderTransmission(text, TYPE_SPEED);
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
