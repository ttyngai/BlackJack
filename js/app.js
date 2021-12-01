/*----- constants -----*/
const enabledButtonColor = '#0d331f';
const enabledHintColor = '#ffdd01';
const disabledButtonColor = '#06170e';
const suits = ['s', 'c', 'd', 'h'];
const ranks = [
  'A',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
  '09',
  '10',
  'J',
  'Q',
  'K',
];

// dialogues (Win/loss message)
const dialogues = {
  c: [
    'Come at me.',
    'You sure you want this?',
    `Don't even try.`,
    `I'm warning you.`,
    `I can read your mind.`,
  ],
  h: [
    `How'bout my Aston too?`,
    'I can smell the win.',
    `Here I come.`,
    `I'm winning.`,
    `I'll eat your lunch.`,
  ],
  w: [
    `(Win) I owned you.`,
    `(Win) I'd stop if I were you.`,
    `(Win) Oh snap.`,
    `(Win) Empty your pockets.`,
    `(Win) You smell like bankrupcy.`,
  ],
  l: [
    `(Lose) What in the...?`,
    `(Lose) ...I'm actually broke.`,
    `(Lose) Impossible...`,
    `(Lose) Bull crap.`,
    `(Lose) It's rigged.`,
  ],
  t: [`(Tie) It's meant to be.`, `(Tie) It's destiny.`],
  b: ['Ohh ffs...', 'You BUSTED!'],
};

const hintDialogues = {
  sp: [`I'd probably split this.`],
  d: [`Doubling is a good idea.`],
  h: [`I'd hit this.`],
  s: [`Let's just stand on this.`],
  q: [`Quiet.`, `Shut it.`, `Chill out.`, `Pokerface please.`, `Wait.`],
};

/*----- app's state (variables) -----*/

let handArray = {
  d: [],
  p1: [],
};
let handArrayCardId = {
  d: [],
  p1: [],
};
const score = {
  d: 0,
  p: 0,
};

const cardValue = {};
const cardClass = {};
let arrayOfHandIds = [];
let doubledHandMap = [];
let cardIdNum = 0;
let secretCardId,
  dealersNotSecretCard,
  dealersSecretCard,
  dealerWinNum,
  playerWinNum,
  busted,
  playerBling,
  autoClick;
let runningAutoPilot = false;
let endPlayer = false;
let endDealer = false;
let dealerHasBlackJack = false;
let focusedHand = 0;
let newHandId = 0;
// forAutoPilot use
let gameEnded = true;
let handEnded = true;
let cardDealDelay = 500;
let computerFlowDelay = 20;
/*----- cached element references -----*/

let scoreBox = {
  d: document.getElementById('dealersScoreBox'),
  p: document.getElementById('playersScoreBox'),
};
let sumBox = {
  d: document.getElementById('dealersSumBox'),
  p1: document.getElementById('playersSumBox'),
};
let buttonStatus = {
  sm: document.getElementById('startMission'),
  ap: document.getElementById('auto'),
  st: document.getElementById('start'),
  sp: document.getElementById('split'),
  d: document.getElementById('double'),
  h: document.getElementById('hit'),
  s: document.getElementById('stand'),
  hint: document.getElementById('hint'),
};
let dialogueContainer = {
  d: document.getElementById('dealerSays'),
  p: document.getElementById('playerSays'),
};

/*----- event listeners -----*/
buttonStatus.sm.addEventListener('click', startMission);
buttonStatus.ap.addEventListener('click', runAutoPilot);
buttonStatus.st.addEventListener('click', runMasterFlow);
buttonStatus.sp.addEventListener('click', runSplit);
buttonStatus.d.addEventListener('click', runDouble);
buttonStatus.h.addEventListener('click', runHit);
buttonStatus.s.addEventListener('click', stand);
buttonStatus.hint.addEventListener('click', runHint);

/*----- functions -----*/
init();

function init() {
  disableSplitButton();
  disableDoubleButton();
  disableHitButton();
  disableStandButton();

  scoreBox.d.innerHTML = 0;
  scoreBox.p.innerHTML = 0;
}

// START MISSION from cover page
function startMission() {
  document.getElementById('introContainer').remove();
  document.getElementById('coverPage').classList.add('introFadeOut');
  setTimeout(function () {
    document.getElementById('coverPage').remove();
  }, 2000);
}

function runMasterFlow() {
  dealersDialogue();
  playersDialogue();
  masterFlow();
  enableAutoPilotButton();
  runningAutoPilot = false;
  buttonStatus.st.innerHTML = 'Again';
  setTimeout(function () {
    disableStartButton();
    disableSplitButton();
    disableDoubleButton();
    disableHitButton();
    disableStandButton();
    enableHintButton();
  }, cardDealDelay);
}

function masterFlow(card1, card2, card3, card4) {
  ///////////// TEST;

  // card1 = 5;
  // card2 = 11;
  // card3 = 8;
  // card4 = 8;

  ////////////// TEST;
  disableStartButton();
  disableSplitButton();
  disableDoubleButton();
  disableHitButton();
  disableStandButton();
  enableHintButton();
  gameEnded = false;
  newHandId = 0;
  cardIdNum = 0;
  focusedHand = 0;
  idsOfDoubledHands = [];
  handArray = {
    d: [],
    p1: [],
  };
  handArrayCardId = {
    d: [],
    p1: [],
  };
  sumBox = {
    d: document.getElementById('dealersSumBox'),
    p1: document.getElementById('playersSumBox'),
  };
  arrayOfHandIds = [];

  document.getElementById('dealersArray').innerHTML = '';
  document.getElementById('multiHandsContainer').innerHTML = '';
  document.getElementById(
    'multiHandsContainer'
  ).innerHTML += `<div class="handContainer">
    <div class="sumBox" id="playersSumBox1"></div>
    <div class="handArray" id="playersArray1"></div>
    </div>`;

  dealerInitSequence(card1, card2);
  setTimeout(function () {
    if (!dealerHasBlackJack) {
      playerInitSequence(card3, card4);
    } else {
      countWins();
    }
    // cardDealDelay needs to be more than Old hand cardDealDelay, at least 1.105
  }, cardDealDelay * 2);
}

// MAIN SEQUENCE START
function dealerInitSequence(card1, card2) {
  dealerWinNum = 0;

  endDealer = false;
  dealersDialogue();
  dealerHasBlackJack = false;
  /////DEALER 2 cards and check blackjack
  // deal dealers twice with second as secret card, with timeouts
  dealCard(handArray.d, 'dealersArray', true, false, card1);
  // update sumbox's first
  updateDealerSumBox();
  // Delay second card for cardDealDelay
  setTimeout(function () {
    dealCard(handArray.d, 'dealersArray', true, true, card2);

    if (checkDealerForBlackJack()) {
      endPlayer = true;
      endDealer = true;
      gameEnded = true;
      dealerHasBlackJack = true;
      updateDealerSumBox();
      flipSecretCard();
      buttonManagement();
    }
  }, cardDealDelay);
}

function playerInitSequence(card3, card4) {
  // index of 1st hand
  playerWinNum = 0;
  endPlayer = false;
  busted = false;
  playersDialogue();
  newHandId++;
  document
    .getElementById(`playersArray${newHandId}`)
    .classList.add('borderBlingOn');
  document
    .getElementById(`playersSumBox${newHandId}`)
    .classList.add('borderBlingOn');
  arrayOfHandIds.push(newHandId);
  // focus on new hand
  focusedHand = newHandId;
  // map first array into doubledHandMap as 1, meaning it's not doubled.
  doubledHandMap = [1];
  // dealing 2 cards to index 1 of hands
  dealCard(
    handArray[`p${newHandId}`],
    `playersArray${newHandId}`,
    null,
    null,
    card3
  );
  updatePlayerSumBox(newHandId, handArray);
  // Delay second card for cardDealDelay
  setTimeout(function () {
    dealCard(
      handArray[`p${newHandId}`],
      `playersArray${newHandId}`,
      null,
      null,
      card4
    );
    updatePlayerSumBox(newHandId, handArray);
    evaluate(handArray[`p${focusedHand}`]);
  }, cardDealDelay);
  setTimeout(function () {
    buttonManagement();
  }, cardDealDelay * 1.1);
}

function runSplit() {
  split();
}
function split(cardA, cardB) {
  disableSplitButton();
  // index of generated hand
  newHandId++;
  playersDialogue();
  dealersDialogue();
  arrayOfHandIds.push(newHandId);
  // new doubledHandMap member for the new row
  doubledHandMap.push(1);

  // Remove bling
  document
    .getElementById(`playersArray${focusedHand}`)
    .classList.remove('borderBlingOn');
  document
    .getElementById(`playersSumBox${focusedHand}`)
    .classList.remove('borderBlingOn');
  // Id of transfer card
  let transferCardId = handArrayCardId[`p${focusedHand}`][1];
  // Previous hand of Focus stored
  let originalHand = focusedHand;
  // focus on new hand
  focusedHand = newHandId;
  // get transfer class id
  cardClassToTransfer = document.getElementById(`${transferCardId}`)
    .classList[1];
  // removes card from previous row
  handArrayCardId[`p${originalHand}`].splice(
    handArrayCardId[`p${originalHand}`].indexOf(`${transferCardId}`),
    1
  );
  document.getElementById(`${transferCardId}`).remove();

  // take card's numeric value
  splitCard = handArray[`p${originalHand}`].pop();
  handArray[`p${focusedHand}`] = [splitCard];

  // Generate new hand
  document.getElementById(
    'multiHandsContainer'
  ).innerHTML += `<div id="hand${focusedHand}" class="handContainer">
      <div class="sumBox" id="playersSumBox${focusedHand}">0</div>
      <div class="handArray" id="playersArray${focusedHand}"></div>
      </div>`;

  // Add bling to new hand container
  document
    .getElementById(`playersArray${focusedHand}`)
    .classList.add('borderBlingOn');
  document
    .getElementById(`playersSumBox${focusedHand}`)
    .classList.add('borderBlingOn');
  // put in splitted card

  handArrayCardId[`p${focusedHand}`] = [`${transferCardId}`];

  document.getElementById(
    `playersArray${focusedHand}`
  ).innerHTML += `<div id="${transferCardId}" class="card ${cardClassToTransfer}"></div>`;
  setTimeout(function () {
    document
      .getElementById(`${transferCardId}`)
      .classList.add('cardDealAnimation');
  }, computerFlowDelay * 2);

  // deal old hand second card
  setTimeout(function () {
    // run deal card
    dealCard(
      handArray[`p${originalHand}`],
      `playersArray${originalHand}`,
      null,
      null,
      cardA
    );
    updatePlayerSumBox(originalHand, handArray);
  }, computerFlowDelay * 2);

  // deal new hand second card
  setTimeout(function () {
    dealCard(
      handArray[`p${newHandId}`],
      `playersArray${newHandId}`,
      null,
      null,
      cardB
    );
    updatePlayerSumBox(newHandId, handArray);
  }, cardDealDelay);
  setTimeout(function () {
    buttonManagement();
    // Want to have buttonManagement invoked at the end
  }, cardDealDelay * 1.2);
}
function runDouble() {
  double();
}
function double(num) {
  let isDoubleMode = true;
  disableDoubleButton();
  // double weight of this focusedHand
  doubledHandMap[focusedHand - 1] = 2;
  idsOfDoubledHands.push(`p${focusedHand}`);
  document.getElementById(
    `playersSumBox${focusedHand}`
  ).parentElement.innerHTML += `<div id="double${focusedHand}" class="double">2x</div>`;
  setTimeout(function () {
    document
      .getElementById(`double${focusedHand}`)
      .classList.add('cardDealAnimation');

    hit(num, isDoubleMode);
    // heres how it ignores the also row

    setTimeout(function () {
      shiftFocus();
      setTimeout(function () {
        if (endPlayer) {
          runDealer();
          buttonManagement();
        }
      }, computerFlowDelay);
    }, cardDealDelay);
  }, computerFlowDelay);
}

function runHit() {
  hit();
}
function hit(num, isDoubleMode) {
  playersDialogue();
  dealersDialogue();
  disableHitButton();
  dealCard(
    handArray[`p${focusedHand}`],
    `playersArray${focusedHand}`,
    null,
    null,
    num
  );
  updatePlayerSumBox(focusedHand, handArray);
  evaluate(handArray[`p${focusedHand}`]);

  handleEvaluated(null, isDoubleMode);

  if (endPlayer) {
    setTimeout(function () {
      runDealer();
    }, cardDealDelay);
  }
  buttonManagement();
}

function stand() {
  playersDialogue();
  dealersDialogue();
  shiftFocus();
  if (endPlayer) {
    setTimeout(function () {
      runDealer();
    }, cardDealDelay);
  }
  buttonManagement();
}

//MAIN SWQUENCE ENDS

function runDealer() {
  flipSecretCard();
  updateDealerSumBox();
  evaluate(handArray.d, true);
  // if all busted no need to open

  let playerSumBoxTotal = [];
  for (i = 1; i <= Object.keys(sumBox).length - 1; i++) {
    playerSumBoxTotal.push(parseInt(sumBox[`p${i}`].innerHTML));
  }
  let count = 0;
  playerSumBoxTotal.forEach(function (sum) {
    if (sum > 21) {
      count++;
    }
  });

  if (count === playerSumBoxTotal.length) {
    endDealer = true;
    countWins();
    buttonManagement();
  } else {
    setTimeout(function () {
      dealRestOfDealer();
    }, computerFlowDelay);
  }
}
function dealRestOfDealer() {
  if (!endDealer) {
    setTimeout(function () {
      dealCard(handArray.d, 'dealersArray', true, null, null);
      updateDealerSumBox();
      evaluate(handArray.d, true);
      setTimeout(function () {
        dealRestOfDealer();
        setTimeout(function () {}, cardDealDelay);
      }, cardDealDelay);

      // cardDealDelay *2 to place 3rd card after secret card flipped
    }, cardDealDelay * 2);
  } else if (endDealer) {
    countWins();
  }
  setTimeout(function () {
    buttonManagement();
  }, cardDealDelay * 2);
}

function countWins() {
  let playerSumBoxTotal = [];
  let dealerSum = parseInt(sumBox.d.innerHTML);
  if (!dealerHasBlackJack) {
    for (i = 1; i <= Object.keys(sumBox).length - 1; i++) {
      playerSumBoxTotal.push(parseInt(sumBox[`p${i}`].innerHTML));
    }
  }
  // player win conditions
  for (i = 0; i < playerSumBoxTotal.length; i++) {
    if (
      !dealerHasBlackJack &&
      endDealer &&
      endPlayer &&
      ((dealerSum > 21 && playerSumBoxTotal[i] <= 21) ||
        (dealerSum < playerSumBoxTotal[i] && playerSumBoxTotal[i] <= 21))
    ) {
      addScoreIsPlayer(true, doubledHandMap[i]);
    }
  }
  // dealer win conditions
  for (i = 0; i < playerSumBoxTotal.length; i++) {
    if (
      !dealerHasBlackJack &&
      endDealer &&
      endPlayer &&
      ((playerSumBoxTotal[i] > 21 && dealerSum <= 21) ||
        (dealerSum > playerSumBoxTotal[i] && dealerSum <= 21))
    ) {
      addScoreIsPlayer(false, doubledHandMap[i]);
    }
  }
  if (dealerHasBlackJack) {
    addScoreIsPlayer(false, 1);
  }
}
function addScoreIsPlayer(isPlayer, multiple) {
  if (isPlayer) {
    score.p += multiple;
    winningDialogueIsPlayer(true);
    scoreBox.p.innerHTML = score.p;
    scoreBoxBlingIsPlayer(true);
  } else {
    score.d += multiple;
    winningDialogueIsPlayer(false);
    scoreBox.d.innerHTML = score.d;
    scoreBoxBlingIsPlayer(false);
  }
}

function evaluate(array, isDealer) {
  checkAndReduceAce(array);
  if (!isDealer) {
    updatePlayerSumBox(focusedHand, handArray);
    let sum = parseInt(sumBox[`p${focusedHand}`].innerHTML);
    if (sum > 21) {
      handEnded = true;
      // bust managed in allBusted in runDealer
      busted = true;
      bustedDialogue();
    }
  } else {
    updateDealerSumBox();
    let dealerSum = parseInt(sumBox.d.innerHTML);
    if (dealerSum >= 17) {
      endDealer = true;
      handEnded = true;
    }
  }
}

function handleEvaluated(isDealer, isDoubleMode) {
  // player busted

  if (handEnded && busted && !isDealer && !isDoubleMode) {
    shiftFocus();
  }
  // round ended if arrayOfHandsIds.length=0
}

function shiftFocus() {
  handEnded = true;
  document
    .getElementById(`playersArray${focusedHand}`)
    .classList.remove('borderBlingOn');
  document
    .getElementById(`playersSumBox${focusedHand}`)
    .classList.remove('borderBlingOn');
  // removed focusedHand aka changing focus
  arrayOfHandIds.splice(arrayOfHandIds.indexOf(focusedHand), 1);

  if (arrayOfHandIds.length >= 1) {
    handEnded = false;
    focusedHand = arrayOfHandIds[arrayOfHandIds.length - 1];
    if (focusedHand > 0) {
      document
        .getElementById(`playersArray${focusedHand}`)
        .classList.add('borderBlingOn');
      document
        .getElementById(`playersSumBox${focusedHand}`)
        .classList.add('borderBlingOn');
    }
  }

  if (arrayOfHandIds.length === 0) {
    endPlayer = true;
    focusedHand = 0;
    gameEnded = true;
    handEnded = true;
  }
  buttonManagement();
}

// START OF DEAL CARD
// Generate new card with Id attached to lookup
function dealCard(handArray, targetArrayId, isDealer, isSecret, num) {
  cardIdNum++;
  // Generate number 1-13
  let newCard = randomCard();
  if (num) {
    newCard = num;
  }

  // Process number 1 to 11, 11-13 to 10
  let processedCard = convertAceToEleven(convertFaceToTen(newCard));
  // Push processedCard numeric number to handArray
  handArray.push(processedCard);
  // assign ID
  cardValue[`card${cardIdNum}`] = processedCard;
  cardClass[`card${cardIdNum}`] = `${suits[randomSuits()]}${
    ranks[newCard - 1]
  }`;
  // Also assign ID to parallel array
  if (!isDealer) {
    let handId = targetArrayId.replace('playersArray', '');
    handArrayCardId[`p${handId}`].push(`card${cardIdNum}`);
  } else {
    handArrayCardId.d.push(`card${cardIdNum}`);
  }
  // If these are first two cards, face value is saved (For blackjack identifications)
  if (isDealer && isSecret) {
    dealersSecretCard = newCard;
  } else if (isDealer && !isSecret) {
    dealersNotSecretCard = newCard;
  }

  //insert SVG into selected array, manages secretCard as well
  if (isSecret) {
    document.getElementById(
      `${targetArrayId}`
    ).innerHTML += `<div id=card${cardIdNum} class="card back-red"></div>`;
  } else {
    document.getElementById(
      `${targetArrayId}`
    ).innerHTML += `<div id=card${cardIdNum} class="card ${
      cardClass[`card${cardIdNum}`]
    }"></div>`;
  }

  //animate the above
  setTimeout(function () {
    document
      .getElementById(`card${cardIdNum}`)
      .classList.add('cardDealAnimation');
  }, computerFlowDelay);
}

// Updates sumBoxPlayer
function updatePlayerSumBox(focusedHand, targetArray) {
  // assigns sumBox target document element
  sumBox[`p${focusedHand}`] = document.getElementById(
    `playersSumBox${focusedHand}`
  );
  // calculates new value for sumbox
  sumBox[`p${focusedHand}`].innerHTML = targetArray[`p${focusedHand}`].reduce(
    (a, b) => a + b
  );
}
function updateDealerSumBox() {
  if (endPlayer) {
    sumBox.d.innerHTML = handArray.d.reduce((a, b) => a + b);
  } else
    document.getElementById(`dealersSumBox`).innerHTML = convertAceToEleven(
      convertFaceToTen(dealersNotSecretCard)
    );
}

// Flip secret card
function flipSecretCard() {
  setTimeout(function () {
    document.getElementById(`card2`).classList.add('hiddenCardFlipOne');
  }, computerFlowDelay);

  setTimeout(function () {
    document.getElementById(`card2`).className = `card ${cardClass.card2}`;
    document.getElementById(`card2`).classList.add(`hiddenCardRotated`);
    setTimeout(function () {
      document.getElementById(`card2`).classList.add('hiddenCardFlipTwo');
    }, computerFlowDelay);
  }, cardDealDelay);
}

// Check for dealers Black Jack
function checkDealerForBlackJack() {
  if (dealersSecretCard === 1 && dealersNotSecretCard >= 11) {
    return true;
  } else if (dealersSecretCard >= 11 && dealersNotSecretCard === 1) {
    return true;
  } else return false;
}

// Converts Ace to 11 numerically
function convertAceToEleven(newCard) {
  if (newCard === 1) return 11;
  return newCard;
}

// Converts all face cards to 10 numerically
function convertFaceToTen(newCard) {
  if (newCard >= 11) return 10;
  return newCard;
}

// Checks if busted total contains Ace that could be converted from 11 to 1
function checkAndReduceAce(array) {
  if (array.reduce((a, b) => a + b) >= 22 && array.includes(11)) {
    array[array.indexOf(11)] = 1;
  }
  return array;
}

// Random card from 1-13
function randomCard() {
  return Math.floor(Math.random() * 12 + 1);
}
function randomDialogue() {
  return Math.floor(Math.random() * 5);
}
function randomSuits() {
  return Math.floor(Math.random() * 4);
}

// BLINGS
// Score Box Bling
function scoreBoxBling() {
  scoreBox.p.classList.remove('scoreBoxBling');
  setTimeout(function () {
    scoreBox.p.classList.add('scoreBoxBling');
  }, computerFlowDelay);

  scoreBox.d.classList.remove('scoreBoxBling');
  setTimeout(function () {
    scoreBox.d.classList.add('scoreBoxBling');
  }, computerFlowDelay);
}

function scoreBoxBlingIsPlayer(isPlayer) {
  if (isPlayer) {
    scoreBox.p.classList.remove('scoreBoxBling');
    setTimeout(function () {
      scoreBox.p.classList.add('scoreBoxBling');
    }, computerFlowDelay);
  } else {
    scoreBox.d.classList.remove('scoreBoxBling');
    setTimeout(function () {
      scoreBox.d.classList.add('scoreBoxBling');
    }, computerFlowDelay);
  }
}

function buttonBling(buttonId) {
  document.getElementById(buttonId).classList.remove('buttonBling');
  setTimeout(function () {
    document.getElementById(buttonId).classList.add('buttonBling');
  }, computerFlowDelay);
}

function dealersDialogue() {
  dialogueContainer.d.innerHTML = dialogues.c[randomDialogue()];
}
function playersDialogue() {
  dialogueContainer.p.innerHTML = dialogues.h[randomDialogue()];
}

function winningDialogueIsPlayer(isTrue) {
  if (isTrue) {
    dialogueContainer.p.innerHTML = '';
    dialogueContainer.p.innerHTML = dialogues.w[randomDialogue()];
    dialogueContainer.d.innerHTML = '';
    dialogueContainer.d.innerHTML = dialogues.l[randomDialogue()];
  } else {
    dialogueContainer.p.innerHTML = '';
    dialogueContainer.p.innerHTML = dialogues.l[randomDialogue()];
    dialogueContainer.d.innerHTML = '';
    dialogueContainer.d.innerHTML = dialogues.w[randomDialogue()];
  }
}
function tieDialogue() {
  dialogueContainer.p.innerHTML = dialogues.t[0];
  dialogueContainer.d.innerHTML = dialogues.t[1];
}

function bustedDialogue() {
  dialogueContainer.p.innerHTML = '';
  dialogueContainer.p.innerHTML = dialogues.b[0];
  dialogueContainer.d.innerHTML = '';
  dialogueContainer.d.innerHTML = dialogues.b[1];
}

function runHint() {
  // true mean will click for you
  disableHintButton();

  perfectStrategyClicker(false);

  setTimeout(function () {
    enableHintButton();
  }, cardDealDelay * 6);
}

function hintDialogue(action) {
  if (action === 'split') {
    dialogueContainer.p.innerHTML = '';
    dialogueContainer.p.innerHTML = hintDialogues.sp[0];
  } else if (action === 'double') {
    dialogueContainer.p.innerHTML = '';
    dialogueContainer.p.innerHTML = hintDialogues.d[0];
  } else if (action === 'hit') {
    dialogueContainer.p.innerHTML = '';
    dialogueContainer.p.innerHTML = hintDialogues.h[0];
  } else if (action === 'stand') {
    dialogueContainer.p.innerHTML = '';
    dialogueContainer.p.innerHTML = hintDialogues.s[0];
  } else {
    dialogueContainer.p.innerHTML = '';
    dialogueContainer.p.innerHTML = hintDialogues.q[randomDialogue()];
  }
}

// Button enable/disable

function buttonManagement() {
  // splitable
  if (
    focusedHand &&
    handArray[`p${focusedHand}`].length === 2 &&
    handArray[`p${focusedHand}`][0] === handArray[`p${focusedHand}`][1]
  ) {
    enableSplitButton();
  } else {
    disableSplitButton();
  }

  // Double-ABLE
  if (focusedHand && handArray[`p${focusedHand}`].length === 2) {
    enableDoubleButton();
  } else {
    disableDoubleButton();
  }

  // Hitable
  if (!endPlayer) {
    enableHitButton();
    enableStandButton();
  } else {
    disableHitButton();
    disableStandButton();
  }

  if (endPlayer && endDealer) {
    enableStartButton();
    if (runningAutoPilot) {
      setTimeout(function () {
        autoPilot();
      }, cardDealDelay * 3);
    }
  }
}
// AutoPilot button
function enableAutoPilotButton() {
  buttonStatus.ap.disabled = false;
  buttonStatus.ap.style.background = enabledButtonColor;
}
function disableAutoPilotButton() {
  buttonStatus.ap.disabled = true;
  buttonStatus.ap.style.background = disabledButtonColor;
}
// Start/Again/Reset whatever you call it
function enableStartButton() {
  buttonStatus.st.disabled = false;
  buttonStatus.st.style.background = enabledButtonColor;
}
function disableStartButton() {
  buttonStatus.st.disabled = true;
  buttonStatus.st.style.background = disabledButtonColor;
}
//Split
function enableSplitButton() {
  if (runningAutoPilot) {
    buttonStatus.sp.style.background = enabledButtonColor;
  } else {
    buttonStatus.sp.disabled = false;
    buttonStatus.sp.style.background = enabledButtonColor;
  }
}
function disableSplitButton() {
  buttonStatus.sp.disabled = true;
  buttonStatus.sp.style.background = disabledButtonColor;
}
//Double
function enableDoubleButton() {
  if (runningAutoPilot) {
    buttonStatus.d.style.background = enabledButtonColor;
  } else {
    buttonStatus.d.disabled = false;
    buttonStatus.d.style.background = enabledButtonColor;
  }
}
function disableDoubleButton() {
  buttonStatus.d.disabled = true;
  buttonStatus.d.style.background = disabledButtonColor;
}
// Hit
function enableHitButton() {
  if (runningAutoPilot) {
    buttonStatus.h.style.background = enabledButtonColor;
  } else {
    buttonStatus.h.disabled = false;
    buttonStatus.h.style.background = enabledButtonColor;
  }
}
function disableHitButton() {
  buttonStatus.h.disabled = true;
  buttonStatus.h.style.background = disabledButtonColor;
}
// stand
function enableStandButton() {
  if (runningAutoPilot) {
    buttonStatus.s.style.background = enabledButtonColor;
  } else {
    buttonStatus.s.disabled = false;
    buttonStatus.s.style.background = enabledButtonColor;
  }
}
function disableStandButton() {
  buttonStatus.s.disabled = true;
  buttonStatus.s.style.background = disabledButtonColor;
}
// hint
function enableHintButton() {
  if (runningAutoPilot) {
    buttonStatus.hint.style.background = disabledButtonColor;
    buttonStatus.hint.style.color = `grey`;
  } else {
    buttonStatus.hint.disabled = false;
    buttonStatus.hint.style.background = enabledHintColor;
    buttonStatus.hint.disabled = false;
    buttonStatus.hint.style.color = `#000000`;
  }
}
function disableHintButton() {
  buttonStatus.hint.disabled = true;
  buttonStatus.hint.style.background = disabledButtonColor;
  buttonStatus.hint.disabled = true;
  buttonStatus.hint.style.color = '#FFFFFF';
}
// Autopilot times
let clickProgramDelay = 700;
runAutoPilot();
function runAutoPilot() {
  cardDealDelay = 100;
  disableAutoPilotButton();
  disableSplitButton();
  disableDoubleButton();
  disableHitButton();
  disableStandButton();
  disableHintButton();
  runningAutoPilot = true;
  buttonStatus.st.innerHTML = 'Start';
  autoPilot();
}

function autoPilot() {
  masterFlow();
  setTimeout(function () {
    perfectStrategyClicker(true);
  }, clickProgramDelay);
}

function perfectStrategyClicker(autoClick) {
  let dealerCard1, playerCard1, playerCard2, playerSum;
  if (focusedHand != 0) {
    dealerCard1 = handArray.d[0];
    playerCard1 = handArray[`p${focusedHand}`][0];
    playerCard2 = handArray[`p${focusedHand}`][1];
    playerSum = parseInt(sumBox[`p${focusedHand}`].innerHTML);

    // split
    if (
      (playerCard1 === playerCard2 &&
        ((dealerCard1 >= 2 &&
          dealerCard1 <= 7 &&
          playerCard1 >= 2 &&
          playerCard1 <= 3) ||
          (dealerCard1 >= 5 && dealerCard1 <= 6 && playerCard1 === 4) ||
          (dealerCard1 >= 2 && dealerCard1 <= 6 && playerCard1 === 6) ||
          (dealerCard1 >= 2 && dealerCard1 <= 7 && playerCard1 === 7) ||
          (dealerCard1 >= 2 && dealerCard1 <= 11 && playerCard1 === 8) ||
          (((dealerCard1 >= 2 && dealerCard1 <= 6) ||
            (dealerCard1 >= 8 && dealerCard1 <= 9)) &&
            playerCard1 === 9))) ||
      (dealerCard1 >= 2 &&
        dealerCard1 <= 11 &&
        ((playerCard1 === 1 && playerCard2 === 11) ||
          (playerCard1 === 11 && playerCard2 === 1)))
    ) {
      if (autoClick) {
        split();
        setTimeout(function () {
          perfectStrategyClicker(autoClick);
        }, cardDealDelay);
        buttonBling('split');
      }
      if (!runningAutoPilot && !gameEnded) {
        hintDialogue('split');
      }
    }

    // double
    else if (
      handArray[`p${focusedHand}`].length === 2 &&
      ((dealerCard1 >= 3 && dealerCard1 <= 6 && playerSum === 9) ||
        (dealerCard1 >= 2 && dealerCard1 <= 9 && playerSum === 10) ||
        (dealerCard1 >= 2 && dealerCard1 <= 10 && playerSum === 11))
    ) {
      if (autoClick) {
        double();
        setTimeout(function () {
          perfectStrategyClicker(autoClick);
        }, cardDealDelay);
        buttonBling('double');
      }
      if (!runningAutoPilot && !gameEnded) {
        hintDialogue('double');
      }
    }

    // hit
    else if (
      playerSum <= 16 &&
      ((dealerCard1 >= 2 &&
        dealerCard1 <= 11 &&
        playerSum >= 4 &&
        playerSum <= 11) ||
        (dealerCard1 >= 2 &&
          dealerCard1 <= 3 &&
          playerSum >= 4 &&
          playerSum <= 11) ||
        (dealerCard1 >= 7 &&
          dealerCard1 <= 11 &&
          playerSum >= 12 &&
          playerSum <= 16))
    ) {
      if (autoClick) {
        hit();
        setTimeout(function () {
          perfectStrategyClicker(autoClick);
        }, cardDealDelay);
        buttonBling('hit');
      }
      if (!runningAutoPilot && !gameEnded) {
        hintDialogue('hit');
      }
    }
    // stand
    else if (playerSum <= 21) {
      if (autoClick) {
        stand();
        setTimeout(function () {
          perfectStrategyClicker(autoClick);
        }, cardDealDelay);
        buttonBling('stand');
      }
      if (!runningAutoPilot && !gameEnded) {
        hintDialogue('stand');
      }
    }
    // all 4 state is complete
  }
  if (focusedHand === 0) {
    if (!runningAutoPilot) {
      hintDialogue('');
    }
  }
}
