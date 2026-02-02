function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateEvent(playerName, foodText) {
  const LOCATIONS = [
    "in a narrow alley",
    "near a street stall",
    "inside a crowded market",
    "under flickering lights",
    "by a broken vending machine"
  ];

  const INCIDENTS = [
    "things escalated quickly",
    "attention shifted suddenly",
    "the situation turned tense",
    "someone intervened",
    "control was lost"
  ];

  return `
${playerName} was searching for food ${pick(LOCATIONS)}.

They found ${foodText}.
${pick(INCIDENTS)}.
`.trim();
}
