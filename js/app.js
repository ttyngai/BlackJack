/*----- constants -----*/
const enabledButtonColor = '#0d331f';
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
    'Kitchen sink incoming.',
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
  bj: ['(Lose) No f*^%ing way..', '(Win) BLACK JACK BABY!'],
  b: ['(Lose) Ohh ffs...', '(Win) You BUSTED!'],
};

/*----- app's state (variables) -----*/
// let firstCard,
//   hiddenCardProcessedValue,
//   dealersFirstCard,
//   hiddenCardDisplay,
//   playerEndedTurn,
//   hiddenCardId;
// let score = {};
let dealtCards = {
  d: [0],
  p1: [0],
};

let maxRound = 7;
let cardDealDelay = 500;
let computerFlowDelay = 50;
let isAutoPilot = false;
// Id intializing
let dealtCardId = 0;

/*----- cached element references -----*/
let gameEnded;

function autoPilot() {
  // min is 50
  buttonStatus.r.removeEventListener('click', reset);
  buttonStatus.r.addEventListener('click', reloadPage);
  buttonStatus.r.innerHTML = 'Exit';
  buttonStatus.d.remove();
  buttonStatus.h.remove();
  buttonStatus.s.remove();
  enableResetButton();
  isAutoPilot = true;
  cardDealDelay = 300;
  startMission();
  runAutoPilot();
}

function runAutoPilot() {
  setTimeout(function () {
    deal();
    setTimeout(function () {
      autoHit();
      // cardDealDelay needs to be above 4.5 to be reliable in counting 17 @50ms
    }, cardDealDelay * 6);
    // cardDealDelay needs to be above 4 to not error out @ 50ms
  }, cardDealDelay * 4);
}

function autoHit() {
  let playersSum = dealtCards.p1.reduce((a, b) => a + b);
  // Dealer has 4 - 6, player has 12-16, should stay
  if (
    !gameEnded &&
    dealtCards.d[1] >= 4 &&
    dealtCards.d[1] <= 6 &&
    playersSum >= 12 &&
    playersSum <= 16
  ) {
    stay();
    setTimeout(function () {
      runAutoPilot();
    }, cardDealDelay);
  }
  // Dealer has 2 or 3, player has 13-16, should stay
  else if (
    !gameEnded &&
    dealtCards.d[1] >= 2 &&
    dealtCards.d[1] <= 3 &&
    playersSum >= 13 &&
    playersSum <= 16
  ) {
    stay();
    setTimeout(function () {
      runAutoPilot();
    }, cardDealDelay);
  } else if (!gameEnded && playersSum < 17) {
    setTimeout(function () {
      hit();
      setTimeout(function () {
        autoHit();
      }, cardDealDelay);
    }, cardDealDelay);
  }
  // Player has over 17, should stay
  else if (!gameEnded && playersSum >= 17) {
    stay();
    setTimeout(function () {
      runAutoPilot();
      // cardDealDelay min *4
    }, cardDealDelay * 4);
  } else if (gameEnded) {
    setTimeout(function () {
      runAutoPilot();
    }, cardDealDelay);
  }
}

// START MISSION from cover page
function startMission() {
  document.getElementById('introContainer').remove();
  document.getElementById('coverPage').classList.add('introFadeOut');
  setTimeout(function () {
    document.getElementById('coverPage').remove();
    scoreBoxBling(true);
    scoreBoxBling(false);
    buttonBling('start');
  }, 2000);
}

// init();
// function init() {
//   disableHitStayButton();
//   disableResetButton();
//   dealtCards = {
//     d: [0],
//     p1: [0],
//   };
//   // score = {
//   //   d: [0],
//   //   p: [0],
//   // };
//   calc();
// }
// function reset() {
//   disableHitStayButton();
//   dealtCards = {
//     d: [0],
//     p1: [0],
//   };
//   score = {
//     d: [0],
//     p: [0],
//   };
//   document.getElementById('dealersArray').innerHTML = '';
//   document.getElementById('playersArray1').innerHTML = '';
//   dialogueContainer.d.innerHTML = dialogues.c[randomDialogue()];
//   dialogueContainer.p.innerHTML = dialogues.h[randomDialogue()];
//   calc();
//   enableAgainButton();
//   disableResetButton();
//   buttonStatus.d.innerHTML = 'Start';
//   scoreBoxBling(true);
//   scoreBoxBling(false);
// }

// // Deal is pressed
// function deal() {
//   disableResetButton();
//   firstCard = 0;
//   resetScoreBox();
//   dealersFirstCard = '';
//   hiddenCardDisplay = '';
//   playerEndedTurn = false;
//   gameEnded = false;
//   dealtCards = {
//     d: [0],
//     p1: [0],
//   };
//   dialogueContainer.p.innerHTML = '';
//   dialogueContainer.d.innerHTML = '';
//   dialogueContainer.d.innerHTML = dialogues.c[randomDialogue()];
//   dialogueContainer.p.innerHTML = dialogues.h[randomDialogue()];
//   disableAgainButton();
//   setTimeout(function () {
//     buttonStatus.d.innerHTML = 'Again';
//   }, cardDealDelay * 4);
//   document.getElementById('playersArray1').innerHTML = '';
//   document.getElementById('dealersArray').innerHTML = '';
//   let dealer = true;
//   setTimeout(function () {
//     runDealCard(false, 'dealersArray', dealtCards.d, dealer);
//     dealer = false;
//     setTimeout(function () {
//       runDealCard(true, 'dealersArray', dealtCards.d);
//       if (checkForDealerBlackJack()) {
//         gameEnded = true;
//         score.d++;
//         scoreBoxBling(false);
//         showHiddenCard();
//         dealerBlackJack();
//         calc();
//         disableHitStayButton();
//         enableAgainButton();
//         enableResetButton();
//       }
//       if (!gameEnded) {
//         dealPlayer();
//         calc();
//       }
//     }, cardDealDelay);
//   }, cardDealDelay);
// }
// function dealPlayer() {
//   setTimeout(function () {
//     runDealCard(false, 'playersArray1', dealtCards.p1);
//     setTimeout(function () {
//       runDealCard(false, 'playersArray1', dealtCards.p1);
//       setTimeout(function () {
//         calc();
//         enableHitButton();
//         enableStayButton();
//         enableResetButton();
//       }, cardDealDelay);
//     }, cardDealDelay);
//   }, cardDealDelay);
// }

// // Player hits
// function hit() {
//   disableHitStayButton();
//   disableResetButton();
//   dialogueContainer.p.innerHTML = '';
//   dialogueContainer.p.innerHTML = dialogues.h[randomDialogue()];
//   dialogueContainer.d.innerHTML = '';
//   dialogueContainer.d.innerHTML = dialogues.c[randomDialogue()];
//   setTimeout(function () {
//     runDealCard(false, 'playersArray1', dealtCards.p1);
//     calc();
//     if (!gameEnded) {
//       enableStayButton();
//     }
//     let playersSum = dealtCards.p1.reduce((a, b) => a + b);
//     if (playersSum >= 21) {
//       disableHitButton();
//     } else enableHitButton();
//     enableResetButton();
//   }, cardDealDelay);
// }

// // Player stays and ends turn
// function stay() {
//   disableResetButton();
//   playerEndedTurn = true;
//   dealtCards.d.push(convertAceToEleven(convertFaceToTen(hiddenCardDisplay)));
//   showHiddenCard();
//   checkAndReduceAce(dealtCards.d);
//   checkAndReduceAce(dealtCards.p1);
//   disableHitStayButton();

//   calc();
//   // moved out of timeout to prevent 3rd card in autopuiilot
//   setTimeout(function () {
//     dealDealerRemaining();
//     enableAgainButton();
//     enableResetButton();
//   }, cardDealDelay);
// }

// // Render function
// function calc() {
//   let playersSum = dealtCards.p1.reduce((a, b) => a + b);
//   let dealersSum = dealtCards.d.reduce((a, b) => a + b);

//   //   Hit is pressed
//   if (playersSum > 21) {
//     gameEnded = true;
//     score.d++;
//     scoreBoxBling(false);
//     disableHitStayButton();
//     enableAgainButton();
//     dealtCards.d.push(convertAceToEleven(hiddenCardProcessedValue));
//     checkAndReduceAce(dealtCards.d);
//     setTimeout(function () {
//       showHiddenCard();
//     }, cardDealDelay);
//     bustedDialogue();
//   }
//   //   Stay is pressed
//   if (!gameEnded && playerEndedTurn) {
//     if (dealersSum > 21) {
//       gameEnded = true;
//       score.p++;
//       scoreBoxBling(true);
//       winningDialogueIsPlayer(true);
//     } else if (
//       dealersSum <= 21 &&
//       dealersSum > playersSum &&
//       dealersSum >= 17
//     ) {
//       gameEnded = true;
//       score.d++;
//       scoreBoxBling(false);
//       winningDialogueIsPlayer(false);
//     } else if (
//       playersSum <= 21 &&
//       dealersSum >= 17 &&
//       dealersSum < playersSum
//     ) {
//       gameEnded = true;
//       score.p++;
//       scoreBoxBling(true);
//       winningDialogueIsPlayer(true);
//     }
//   }
//   if (playersSum === dealersSum && dealersSum >= 17) {
//     tieDialogue();
//   }
//   render();
// }

// function render() {
//   // for (let num in dealtCards) {
//   //   sumBox[num].innerHTML = dealtCards[num].reduce((a, b) => a + b);
//   // }
//   // for (let num in scoreBox) {
//   //   scoreBox[num].innerHTML = score[num];
//   // }
// }

// // Deal card logic
// function runDealCard(hide, array, dealtCardsArray, dealer) {
//   let newCard = randomCard();

//   dealtCardId++;
//   if (!hide && dealer) {
//     firstCard = newCard;
//   }
//   const newCardEl = document.getElementById(array);
//   const processedCard = convertAceToEleven(convertFaceToTen(newCard));
//   if (dealer === true) {
//     dealersFirstCard = newCard;
//   }
//   if (hide === true) {
//     hiddenCardId = dealtCardId;
//     newCardEl.innerHTML += `<div id="dealtCard${dealtCardId}" class="card back-red"></div>`;
//     setTimeout(function () {
//       document
//         .getElementById(`dealtCard${dealtCardId}`)
//         .classList.add('cardDealAnimation');
//     }, computerFlowDelay);
//     hiddenCardProcessedValue = processedCard;
//     hiddenCardDisplay = newCard;
//   } else {
//     newCardEl.innerHTML += `<div id="dealtCard${dealtCardId}" class="card ${
//       suits[randomSuits()]
//     }${ranks[newCard - 1]}"></div>`;
//     setTimeout(function () {
//       document
//         .getElementById(`dealtCard${dealtCardId}`)
//         .classList.add('cardDealAnimation');
//     }, computerFlowDelay);
//     dealtCardsArray.push(processedCard);
//   }
//   checkAndReduceAce(dealtCardsArray);
//   return dealtCardsArray[dealtCardsArray.length - 1];
// }

// // BlackJack check for dealer
// function checkForDealerBlackJack() {
//   if (firstCard === 1 && hiddenCardDisplay >= 11) {
//     dealtCards.d.push(convertFaceToTen(hiddenCardDisplay));
//     return true;
//   } else if (firstCard >= 11 && hiddenCardDisplay === 1) {
//     dealtCards.d.push(convertAceToEleven(hiddenCardDisplay));
//     return true;
//   }
//   return false;
// }

// // Call back dealers delay function
// function dealDealerRemaining() {
//   if (!gameEnded && dealtCards.d.reduce((a, b) => a + b) < 17) {
//     setTimeout(function () {
//       runDealCard(false, 'dealersArray', dealtCards.d);
//       calc();
//       dealDealerRemaining();
//     }, cardDealDelay);
//   } else return;
// }

// // Show hidden card
// function showHiddenCard() {
//   setTimeout(function () {
//     document
//       .getElementById(`dealtCard${hiddenCardId}`)
//       .classList.add('hiddenCardFlipOne');
//   }, computerFlowDelay);

//   setTimeout(function () {
//     document.getElementById(`dealtCard${hiddenCardId}`).className = `card ${
//       suits[randomSuits()]
//     }${ranks[hiddenCardDisplay - 1]}`;
//     document
//       .getElementById(`dealtCard${hiddenCardId}`)
//       .classList.add(`hiddenCardRotated`);
//     setTimeout(function () {
//       document
//         .getElementById(`dealtCard${hiddenCardId}`)
//         .classList.add('hiddenCardFlipTwo');
//     }, computerFlowDelay);
//   }, cardDealDelay);
// }

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
  if (!isAutoPilot) {
    document.getElementById(buttonId).classList.remove('buttonBling');
    setTimeout(function () {
      document.getElementById(buttonId).classList.add('buttonBling');
    }, computerFlowDelay);
  }
}

// // Reset scorebox after restart
// function resetScoreBox() {
//   dealtCards = {
//     d: [0],
//     p1: [0],
//   };
//   for (let num in dealtCards) {
//     sumBox[num].innerHTML = dealtCards[num].reduce((a, b) => a + b);
//   }
// }

// Dialoge function
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
function dealerBlackJack() {
  dialogueContainer.p.innerHTML = '';
  dialogueContainer.p.innerHTML = dialogues.bj[0];
  dialogueContainer.d.innerHTML = '';
  dialogueContainer.d.innerHTML = dialogues.bj[1];
}

function bustedDialogue() {
  dialogueContainer.p.innerHTML = '';
  dialogueContainer.p.innerHTML = dialogues.b[0];
  dialogueContainer.d.innerHTML = '';
  dialogueContainer.d.innerHTML = dialogues.b[1];
}

// Button enable/disable
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
  buttonStatus.sp.disabled = false;
  buttonStatus.sp.style.background = enabledButtonColor;
}
function disableSplitButton() {
  buttonStatus.sp.disabled = true;
  buttonStatus.sp.style.background = disabledButtonColor;
}
//Double
function enableDoubleButton() {
  buttonStatus.d.disabled = false;
  buttonStatus.d.style.background = enabledButtonColor;
}
function disableDoubleButton() {
  buttonStatus.d.disabled = true;
  buttonStatus.d.style.background = disabledButtonColor;
}
// Hit
function enableHitButton() {
  buttonStatus.h.disabled = false;
  buttonStatus.h.style.background = enabledButtonColor;
}
function disableHitButton() {
  buttonStatus.h.disabled = true;
  buttonStatus.h.style.background = disabledButtonColor;
}
// Stay
function enableStayButton() {
  buttonStatus.s.disabled = false;
  buttonStatus.s.style.background = enabledButtonColor;
}
function disableStayButton() {
  buttonStatus.s.disabled = true;
  buttonStatus.s.style.background = disabledButtonColor;
}

//////////////CACHED ELEMENTS////////////////

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
  ap: document.getElementById('autoPilot'),
  e: document.getElementById('exit'),
  st: document.getElementById('start'),
  sp: document.getElementById('split'),
  d: document.getElementById('double'),
  h: document.getElementById('hit'),
  s: document.getElementById('stay'),
};
let dialogueContainer = {
  d: document.getElementById('dealerSays'),
  p: document.getElementById('playerSays'),
};

/*----- event listeners -----*/
buttonStatus.sm.addEventListener('click', startMission);
buttonStatus.ap.addEventListener('click', autoPilot);
buttonStatus.e.addEventListener('click', reloadPage);
buttonStatus.st.addEventListener('click', masterFlow);
buttonStatus.sp.addEventListener('click', split);
buttonStatus.d.addEventListener('click', double);
buttonStatus.h.addEventListener('click', hitClick);
buttonStatus.s.addEventListener('click', stay);

// /////////CONSTANTS/////////////

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
scoreBox.d.innerHTML = 0;
scoreBox.p.innerHTML = 0;
const cardValue = {};
const cardClass = {};
let cardIdNum = 0;
let secretCardId, dealersNotSecretCard, dealersSecretCard;
let endGame = false;
let endPlayer = false;
let endDealer = false;
let dealerWinNum, playerWinNum;
let endHand, busted;
let focusedHand = 0;
let newHandId = 0;
let arrayOfHandIds = [];
let dealerHasBlackJack = false;
let playerBling;
////////////CONSTANT ENDS/////////////
/*----- functions -----*/
init();
// only for restart
function reloadPage() {
  document.location.reload();
}

function init() {
  disableSplitButton();
  disableDoubleButton();
  disableHitButton();
  disableStayButton();
}

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
  // Hitable
  if (!endPlayer) {
    enableHitButton();
    enableStayButton();
  } else {
    disableHitButton();
    disableStayButton();
  }

  if (endPlayer && endDealer) {
    enableStartButton();
  }
}

function masterFlow() {
  disableStartButton();
  disableSplitButton();
  disableDoubleButton();
  disableHitButton();
  disableStayButton();
  newHandId = 0;
  cardIdNum = 0;
  focusedHand = 0;
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

  dealerInitSequence();
  setTimeout(function () {
    playerInitSequence();
    // cardDealDelay needs to be more than Old hand cardDealDelay, at least 1.105
  }, cardDealDelay * 1.5);
}

// MAIN SEQUENCE START
function dealerInitSequence() {
  dealerWinNum = 0;
  endGame = false;
  endDealer = false;
  dealerHasBlackJack = false;
  /////DEALER 2 cards and check blackjack
  // deal dealers twice with second as secret card, with timeouts
  dealCard(handArray.d, 'dealersArray', true, false);
  // update sumbox's first
  updateDealerSumBox();
  // Delay second card for cardDealDelay
  setTimeout(function () {
    dealCard(handArray.d, 'dealersArray', true, true);
  }, cardDealDelay);
  // Check blackjack
  if (checkDealerForBlackJack()) {
    endGame = true;
    endPlayer = true;
    endDealer = true;
    dealerHasBlackJack = true;
    countWins();
  }
}
//////DEALER 2cardBJ ENDED//////////////
//////player sequence//////

// scope declared;
////////recurring rows////////

function playerInitSequence() {
  // index of 1st hand
  playerWinNum = 0;
  endPlayer = false;
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
  // dealing 2 cards to index 1 of hands
  dealCard(handArray[`p${newHandId}`], `playersArray${newHandId}`);
  updatePlayerSumBox(newHandId, handArray);
  // Delay second card for cardDealDelay
  setTimeout(function () {
    dealCard(handArray[`p${newHandId}`], `playersArray${newHandId}`);
    updatePlayerSumBox(newHandId, handArray);
  }, cardDealDelay);
  setTimeout(function () {
    buttonManagement();
  }, cardDealDelay * 1.1);
}

function split() {
  disableSplitButton();
  // index of generated hand
  newHandId++;
  arrayOfHandIds.push(newHandId);
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
  }, computerFlowDelay);

  // deal old hand second card
  setTimeout(function () {
    // run deal card
    dealCard(handArray[`p${originalHand}`], `playersArray${originalHand}`);

    updatePlayerSumBox(originalHand, handArray);
  }, computerFlowDelay);

  // deal new hand second card
  setTimeout(function () {
    dealCard(handArray[`p${newHandId}`], `playersArray${newHandId}`);
    updatePlayerSumBox(newHandId, handArray);
  }, cardDealDelay);
  setTimeout(function () {
    buttonManagement();
    // Want to have buttonManagement invoked at the end
  }, cardDealDelay * 1.1);
}
function double() {}

function hitClick() {
  hit();
}
function hit(num) {
  dealCard(
    handArray[`p${focusedHand}`],
    `playersArray${focusedHand}`,
    null,
    null,
    num
  );
  updatePlayerSumBox(focusedHand, handArray);
  evaluate(handArray[`p${focusedHand}`]);
  handleEvaluated(handArray[`p${focusedHand}`]);
  if (endPlayer) {
    runDealer();
    buttonManagement();
  }
}
function stay() {
  shiftFocus();
  if (endPlayer) {
    runDealer();
  }
  buttonManagement();
}

//MAIN SWQUENCE ENDS

function runDealer() {
  flipSecretCard();
  updateDealerSumBox();
  evaluate(handArray.d, true);

  if (busted) {
    console.log('finish');
    endDealer = true;
    countWins();
    buttonManagement();
  } else {
    dealRestOfDealer();
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
  for (i = 1; i <= Object.keys(sumBox).length - 1; i++) {
    playerSumBoxTotal.push(parseInt(sumBox[`p${i}`].innerHTML));
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
      addScoreIsPlayer(true);
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
      addScoreIsPlayer(false);
    }
  }
  if (dealerHasBlackJack) {
    addScoreIsPlayer(false);
  }
}
function addScoreIsPlayer(isPlayer) {
  if (isPlayer) {
    score.p++;
    scoreBox.p.innerHTML = score.p;
    scoreBoxBlingIsPlayer(true);
  } else {
    score.d++;
    scoreBox.d.innerHTML = score.d;
    scoreBoxBlingIsPlayer(false);
  }
}

function evaluate(array, isDealer) {
  endHand = false;
  checkAndReduceAce(array);
  if (!isDealer) {
    updatePlayerSumBox(focusedHand, handArray);
    let sum = parseInt(sumBox[`p${focusedHand}`].innerHTML);
    if (sum > 21) {
      endHand = true;
      busted = true;
    }
  } else {
    updateDealerSumBox();
    let dealerSum = parseInt(sumBox.d.innerHTML);
    if (dealerSum >= 17) {
      endDealer = true;
    }
  }
}

function handleEvaluated(array, isDealer) {
  // player busted
  if (endHand && busted && !isDealer) {
    shiftFocus();
  }
  // round ended if arrayOfHandsIds.length=0
}

function shiftFocus() {
  document
    .getElementById(`playersArray${focusedHand}`)
    .classList.remove('borderBlingOn');
  document
    .getElementById(`playersSumBox${focusedHand}`)
    .classList.remove('borderBlingOn');
  arrayOfHandIds.splice(arrayOfHandIds.indexOf(focusedHand), 1);

  focusedHand = arrayOfHandIds[arrayOfHandIds.length - 1];

  if (focusedHand > 0) {
    document
      .getElementById(`playersArray${focusedHand}`)
      .classList.add('borderBlingOn');
    document
      .getElementById(`playersSumBox${focusedHand}`)
      .classList.add('borderBlingOn');
  }
  if (arrayOfHandIds.length === 0) {
    endPlayer = true;
  }
  if (focusedHand > 0) {
    buttonManagement();
  }
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
