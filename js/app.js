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
let firstCard,
  hiddenCardProcessedValue,
  dealersFirstCard,
  hiddenCardDisplay,
  playerEndedTurn,
  hiddenCardId;
let score = {};
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
let scoreBox = {
  d: document.getElementById('dealersScoreBox'),
  p: document.getElementById('playersScoreBox'),
};
let sumBox = {
  d: document.getElementById('dealersSumBox'),
  p1: document.getElementById('playersSumBox1'),
};
let buttonStatus = {
  sm: document.getElementById('startMission'),
  ap: document.getElementById('autoPilot'),
  r: document.getElementById('reset'),
  d: document.getElementById('again'),
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
buttonStatus.r.addEventListener('click', reset);
buttonStatus.d.addEventListener('click', deal);
buttonStatus.h.addEventListener('click', hit);
buttonStatus.s.addEventListener('click', stay);

/*----- functions -----*/

function reloadPage() {
  document.location.reload();
}
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
    scoreBoxBlingIsPlayer(true);
    scoreBoxBlingIsPlayer(false);
    buttonBling('again');
  }, 2000);
}

init();
function init() {
  disableHitStayButton();
  disableResetButton();
  dealtCards = {
    d: [0],
    p1: [0],
  };
  score = {
    d: [0],
    p: [0],
  };
  calc();
}
function reset() {
  disableHitStayButton();
  dealtCards = {
    d: [0],
    p1: [0],
  };
  score = {
    d: [0],
    p: [0],
  };
  document.getElementById('dealersArray').innerHTML = '';
  document.getElementById('playersArray1').innerHTML = '';
  dialogueContainer.d.innerHTML = dialogues.c[randomDialogue()];
  dialogueContainer.p.innerHTML = dialogues.h[randomDialogue()];
  calc();
  enableAgainButton();
  disableResetButton();
  buttonStatus.d.innerHTML = 'Start';
  scoreBoxBlingIsPlayer(true);
  scoreBoxBlingIsPlayer(false);
}

// Deal is pressed
function deal() {
  disableResetButton();
  firstCard = 0;
  resetScoreBox();
  dealersFirstCard = '';
  hiddenCardDisplay = '';
  playerEndedTurn = false;
  gameEnded = false;
  dealtCards = {
    d: [0],
    p1: [0],
  };
  dialogueContainer.p.innerHTML = '';
  dialogueContainer.d.innerHTML = '';
  dialogueContainer.d.innerHTML = dialogues.c[randomDialogue()];
  dialogueContainer.p.innerHTML = dialogues.h[randomDialogue()];
  disableAgainButton();
  setTimeout(function () {
    buttonStatus.d.innerHTML = 'Again';
  }, cardDealDelay * 4);
  document.getElementById('playersArray1').innerHTML = '';
  document.getElementById('dealersArray').innerHTML = '';
  let dealer = true;
  setTimeout(function () {
    runDealCard(false, 'dealersArray', dealtCards.d, dealer);
    dealer = false;
    setTimeout(function () {
      runDealCard(true, 'dealersArray', dealtCards.d);
      if (checkForDealerBlackJack()) {
        gameEnded = true;
        score.d++;
        scoreBoxBlingIsPlayer(false);
        showHiddenCard();
        dealerBlackJack();
        calc();
        disableHitStayButton();
        enableAgainButton();
        enableResetButton();
      }
      if (!gameEnded) {
        dealPlayer();
        calc();
      }
    }, cardDealDelay);
  }, cardDealDelay);
}
function dealPlayer() {
  setTimeout(function () {
    runDealCard(false, 'playersArray1', dealtCards.p1);
    setTimeout(function () {
      runDealCard(false, 'playersArray1', dealtCards.p1);
      setTimeout(function () {
        calc();
        enableHitButton();
        enableStayButton();
        enableResetButton();
      }, cardDealDelay);
    }, cardDealDelay);
  }, cardDealDelay);
}

// Player hits
function hit() {
  disableHitStayButton();
  disableResetButton();
  dialogueContainer.p.innerHTML = '';
  dialogueContainer.p.innerHTML = dialogues.h[randomDialogue()];
  dialogueContainer.d.innerHTML = '';
  dialogueContainer.d.innerHTML = dialogues.c[randomDialogue()];
  setTimeout(function () {
    runDealCard(false, 'playersArray1', dealtCards.p1);
    calc();
    if (!gameEnded) {
      enableStayButton();
    }
    let playersSum = dealtCards.p1.reduce((a, b) => a + b);
    if (playersSum >= 21) {
      disableHitButton();
    } else enableHitButton();
    enableResetButton();
  }, cardDealDelay);
}

// Player stays and ends turn
function stay() {
  disableResetButton();
  playerEndedTurn = true;
  dealtCards.d.push(convertAceToEleven(convertFaceToTen(hiddenCardDisplay)));
  showHiddenCard();
  checkAndReduceAce(dealtCards.d);
  checkAndReduceAce(dealtCards.p1);
  disableHitStayButton();

  calc();
  // moved out of timeout to prevent 3rd card in autopuiilot
  setTimeout(function () {
    dealDealerRemaining();
    enableAgainButton();
    enableResetButton();
  }, cardDealDelay);
}

// Render function
function calc() {
  let playersSum = dealtCards.p1.reduce((a, b) => a + b);
  let dealersSum = dealtCards.d.reduce((a, b) => a + b);

  //   Hit is pressed
  if (playersSum > 21) {
    gameEnded = true;
    score.d++;
    scoreBoxBlingIsPlayer(false);
    disableHitStayButton();
    enableAgainButton();
    dealtCards.d.push(convertAceToEleven(hiddenCardProcessedValue));
    checkAndReduceAce(dealtCards.d);
    setTimeout(function () {
      showHiddenCard();
    }, cardDealDelay);
    bustedDialogue();
  }
  //   Stay is pressed
  if (!gameEnded && playerEndedTurn) {
    if (dealersSum > 21) {
      gameEnded = true;
      score.p++;
      scoreBoxBlingIsPlayer(true);
      winningDialogueIsPlayer(true);
    } else if (
      dealersSum <= 21 &&
      dealersSum > playersSum &&
      dealersSum >= 17
    ) {
      gameEnded = true;
      score.d++;
      scoreBoxBlingIsPlayer(false);
      winningDialogueIsPlayer(false);
    } else if (
      playersSum <= 21 &&
      dealersSum >= 17 &&
      dealersSum < playersSum
    ) {
      gameEnded = true;
      score.p++;
      scoreBoxBlingIsPlayer(true);
      winningDialogueIsPlayer(true);
    }
  }
  if (playersSum === dealersSum && dealersSum >= 17) {
    tieDialogue();
  }
  render();
}

function render() {
  for (let num in dealtCards) {
    sumBox[num].innerHTML = dealtCards[num].reduce((a, b) => a + b);
  }
  for (let num in scoreBox) {
    scoreBox[num].innerHTML = score[num];
  }
}

// Deal card logic
function runDealCard(hide, array, dealtCardsArray, dealer) {
  let newCard = randomCard();

  dealtCardId++;
  if (!hide && dealer) {
    firstCard = newCard;
  }
  const newCardEl = document.getElementById(array);
  const processedCard = convertAceToEleven(convertFaceToTen(newCard));
  if (dealer === true) {
    dealersFirstCard = newCard;
  }
  if (hide === true) {
    hiddenCardId = dealtCardId;
    newCardEl.innerHTML += `<div id="dealtCard${dealtCardId}" class="card back-red"></div>`;
    setTimeout(function () {
      document
        .getElementById(`dealtCard${dealtCardId}`)
        .classList.add('cardDealAnimation');
    }, computerFlowDelay);
    hiddenCardProcessedValue = processedCard;
    hiddenCardDisplay = newCard;
  } else {
    newCardEl.innerHTML += `<div id="dealtCard${dealtCardId}" class="card ${
      suits[randomSuits()]
    }${ranks[newCard - 1]}"></div>`;
    setTimeout(function () {
      document
        .getElementById(`dealtCard${dealtCardId}`)
        .classList.add('cardDealAnimation');
    }, computerFlowDelay);
    dealtCardsArray.push(processedCard);
  }
  checkAndReduceAce(dealtCardsArray);
  return dealtCardsArray[dealtCardsArray.length - 1];
}

// BlackJack check for dealer
function checkForDealerBlackJack() {
  if (firstCard === 1 && hiddenCardDisplay >= 11) {
    dealtCards.d.push(convertFaceToTen(hiddenCardDisplay));
    return true;
  } else if (firstCard >= 11 && hiddenCardDisplay === 1) {
    dealtCards.d.push(convertAceToEleven(hiddenCardDisplay));
    return true;
  }
  return false;
}

// Call back dealers delay function
function dealDealerRemaining() {
  if (!gameEnded && dealtCards.d.reduce((a, b) => a + b) < 17) {
    setTimeout(function () {
      runDealCard(false, 'dealersArray', dealtCards.d);
      calc();
      dealDealerRemaining();
    }, cardDealDelay);
  } else return;
}

// Show hidden card
function showHiddenCard() {
  setTimeout(function () {
    document
      .getElementById(`dealtCard${hiddenCardId}`)
      .classList.add('hiddenCardFlipOne');
  }, computerFlowDelay);

  setTimeout(function () {
    document.getElementById(`dealtCard${hiddenCardId}`).className = `card ${
      suits[randomSuits()]
    }${ranks[hiddenCardDisplay - 1]}`;
    document
      .getElementById(`dealtCard${hiddenCardId}`)
      .classList.add(`hiddenCardRotated`);
    setTimeout(function () {
      document
        .getElementById(`dealtCard${hiddenCardId}`)
        .classList.add('hiddenCardFlipTwo');
    }, computerFlowDelay);
  }, cardDealDelay);
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

// Checks if busted total contains Ace that could be converted from 11 to 1
function checkAndReduceAce(array) {
  if (array.reduce((a, b) => a + b) >= 22 && array.includes(11)) {
    array[array.indexOf(11)] = 1;
  }
  return array;
}

// BLINGS
// Score Box Bling
function scoreBoxBlingIsPlayer(isTrue) {
  if (isTrue) {
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

// Reset scorebox after restart
function resetScoreBox() {
  dealtCards = {
    d: [0],
    p1: [0],
  };
  for (let num in dealtCards) {
    sumBox[num].innerHTML = dealtCards[num].reduce((a, b) => a + b);
  }
}

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
function enableResetButton() {
  buttonStatus.r.disabled = false;
  buttonStatus.r.style.background = enabledButtonColor;
}
function disableResetButton() {
  if (!isAutoPilot) {
    buttonStatus.r.disabled = true;
    buttonStatus.r.style.background = disabledButtonColor;
  }
}
function enableAgainButton() {
  buttonStatus.d.disabled = false;
  buttonStatus.d.style.background = enabledButtonColor;
  buttonBling('again');
}
function disableAgainButton() {
  buttonStatus.d.disabled = true;
  buttonStatus.d.style.background = disabledButtonColor;
}
function enableHitButton() {
  buttonStatus.h.disabled = false;
  buttonStatus.h.style.background = enabledButtonColor;
  buttonBling('hit');
}
function enableStayButton() {
  buttonStatus.s.disabled = false;
  buttonStatus.s.style.background = enabledButtonColor;
  buttonBling('stay');
}

function disableHitStayButton() {
  buttonStatus.h.disabled = true;
  buttonStatus.h.style.background = disabledButtonColor;
  buttonStatus.s.disabled = true;
  buttonStatus.s.style.background = disabledButtonColor;
}
function disableHitButton() {
  buttonStatus.h.disabled = true;
  buttonStatus.h.style.background = disabledButtonColor;
}

// split function//////////////////////////////////////
let splitId = 1;
let dealtCardIdTEST = 1000;
function splitHand(array, transferCardIdNumber) {
  dealtCardIdTEST++;
  splitId++;

  // get transfer class id
  cardClassToTransfer = document.getElementById(
    `dealtCard${transferCardIdNumber}`
  ).classList[1];
  // removes card from previous row
  document.getElementById(`dealtCard${transferCardIdNumber}`).remove();

  // take card's numeric value
  splitCard = array.pop();
  dealtCards[`p${splitId}`] = [0, splitCard];
  // add new row
  document.getElementById(
    'multiHandsContainer'
  ).innerHTML += `<div id="splitHand${splitId}" class="splitHandContainer handContainer">
      <div class="splitHandSumBox sumBox" id="playersSumBox${splitId}">0</div>
      <div class="splitHandArray handArray" id="playersArray${splitId}"></div>
      </div>`;
  // put in splitted card
  document.getElementById(
    `playersArray${splitId}`
  ).innerHTML += `<div id="dealtCard${dealtCardIdTEST}" class="card ${cardClassToTransfer}"></div>`;
  setTimeout(function () {
    document
      .getElementById(`dealtCard${dealtCardIdTEST}`)
      .classList.add('cardDealAnimation');
  }, computerFlowDelay);

  // deal second card
  setTimeout(function () {
    runDealCard(false, `playersArray${splitId}`, dealtCards[`p${splitId}`]);
    sumBox[`p${splitId}`] = document.getElementById(`playersSumBox${splitId}`);
    sumBox[`p${splitId}`].innerHTML = dealtCards[`p${splitId}`].reduce(
      (a, b) => a + b
    );
  }, cardDealDelay);

  return array;
}

function handleEndHand() {}

const handArray = {
  d: [],
  p1: [],
};

// /////////CONSTANTS/////////////
const cardValue = {};
const cardClass = {};
let cardIdNum = 0;
let secretCardId, dealersNotSecretCard, dealersSecretCard;
let endGame = false;
////////////CONSTANT ENDS/////////////

function masterFlow() {
  dealerSequence();
}

// MAIN SEQUENCE START
function dealerSequence() {
  endGame = false;

  /////DEALER 2 cards and check blackjack
  // deal dealers twice with second as secret card, with timeouts
  dealCard(handArray.d, 'dealersArray', true);
  // Delay second card for cardDealDelay
  setTimeout(function () {
    dealCard(handArray.d, 'dealersArray', true, true);
  }, cardDealDelay);
  // Check blackjack
  if (checkDealerForBlackJack()) {
    endGame = true;
    // endGame() which involves activating again buttons, dealerscore++
  }
}
//////DEALER 2cardBJ ENDED//////////////
//////player sequence//////
let focus = 0;
let indexOfHands = 0;
// scope declared;
////////recurring rows/////////
// playHand(Scope)
function playerSequence() {
  // index of 1st hand
  indexOfHands++;
  // dealing 2 cards to index 1 of hands
  dealCard(handArray[`p${indexOfHands}`], `playersArray${indexOfHands}`);
  // Delay second card for cardDealDelay
  setTimeout(function () {
    dealCard(handArray[`p${indexOfHands}`], `playersArray${indexOfHands}`);
  }, cardDealDelay);
}

function playHand(index) {}

// player arrayX populates, scope is arrayX
// split {generates new hand N, scope is now arrayN}
// hit stay

// at end of scope, scope is removed and new scope popped from scope tracker

////////recurring rows end//////////

//////player sequence ENDS//////
//MAIN SWQUENCE ENDS

// START OF DEAL CARD
// Generate new card with Id attached to lookup
function dealCard(handArray, targetArrayId, isDealer, isSecret) {
  cardIdNum++;
  // Generate number 1-13
  let newCard = randomCard();

  // Process number 1 to 11, 11-13 to 10
  let processedCard = convertAceToEleven(convertFaceToTen(newCard + 1));
  // Push processedCard numeric number to handArray
  handArray.push(processedCard);
  // assign ID
  cardValue[`card${cardIdNum}`] = processedCard;
  cardClass[`card${cardIdNum}`] = `${suits[randomSuits()]}${ranks[newCard]}`;
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

// END Of DEAL CARD
