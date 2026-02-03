function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const LOCATIONS = [
  "near a crowded street food stall",
  "outside a closed shop with people waiting",
  "by a metro entrance during rush hour",
  "under a flyover where traffic backed up",
  "at the edge of a night market"
];

const TRIGGERS = [
  "someone misheard a comment",
  "a phone was raised to record",
  "a joke landed the wrong way",
  "someone stepped in to help",
  "an argument drew attention"
];

const ESCALATIONS = [
  "people stopped to watch",
  "voices got louder",
  "nobody backed down",
  "tension spread through the crowd",
  "control slipped away"
];

function generateEvent(actorName, foodText) {
  return `${actorName} was looking for food ${pick(LOCATIONS)}. 
They came across ${foodText}. 
${pick(TRIGGERS)} and ${pick(ESCALATIONS)}.`;
}
