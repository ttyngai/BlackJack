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
  p: [0],
};
let cardId = 0;
let maxRound = 7;
let cardDealDelay = 500;
let computerFlowDelay = 50;
let isAutoPilot = false;
/*----- cached element references -----*/
let gameEnded;
let scoreBox = {
  d: document.getElementById('dealersScoreBox'),
  p: document.getElementById('playersScoreBox'),
};
let sumBox = {
  d: document.getElementById('dealersSumBox'),
  p: document.getElementById('playersSumBox'),
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
  cardDealDelay = 200;
  startMission();
  runAutoPilot();
}

function reloadPage() {
  document.location.reload();
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
  let playersSum = dealtCards.p.reduce((a, b) => a + b);
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
    p: [0],
  };
  score = {
    d: [0],
    p: [0],
  };
  render();
}
function reset() {
  disableHitStayButton();
  dealtCards = {
    d: [0],
    p: [0],
  };
  score = {
    d: [0],
    p: [0],
  };
  document.getElementById('dealersArray').innerHTML = '';
  document.getElementById('playersArray').innerHTML = '';
  dialogueContainer.d.innerHTML = dialogues.c[randomDialogue()];
  dialogueContainer.p.innerHTML = dialogues.h[randomDialogue()];
  render();
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
    p: [0],
  };
  dialogueContainer.p.innerHTML = '';
  dialogueContainer.d.innerHTML = '';
  dialogueContainer.d.innerHTML = dialogues.c[randomDialogue()];
  dialogueContainer.p.innerHTML = dialogues.h[randomDialogue()];
  disableAgainButton();
  setTimeout(function () {
    buttonStatus.d.innerHTML = 'Again';
  }, cardDealDelay * 4);
  document.getElementById('playersArray').innerHTML = '';
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
        render();
        disableHitStayButton();
        enableAgainButton();
        enableResetButton();
      }
      if (!gameEnded) {
        dealPlayer();
        render();
      }
    }, cardDealDelay);
  }, cardDealDelay);
}
function dealPlayer() {
  setTimeout(function () {
    runDealCard(false, 'playersArray', dealtCards.p);
    setTimeout(function () {
      runDealCard(false, 'playersArray', dealtCards.p);
      setTimeout(function () {
        render();
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
    runDealCard(false, 'playersArray', dealtCards.p);
    render();
    if (!gameEnded) {
      enableStayButton();
    }
    let playersSum = dealtCards.p.reduce((a, b) => a + b);
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
  checkAndReduceAce(dealtCards.p);
  disableHitStayButton();

  render();
  // moved out of timeout to prevent 3rd card in autopuiilot
  setTimeout(function () {
    dealDealerRemaining();
    enableAgainButton();
    enableResetButton();
  }, cardDealDelay);
}

// Call back dealers delay function
function dealDealerRemaining() {
  if (!gameEnded && dealtCards.d.reduce((a, b) => a + b) < 17) {
    setTimeout(function () {
      runDealCard(false, 'dealersArray', dealtCards.d);
      render();
      dealDealerRemaining();
    }, cardDealDelay);
  } else return;
}

// Render function
function render() {
  let playersSum = dealtCards.p.reduce((a, b) => a + b);
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

  cardId++;
  if (!hide && dealer) {
    firstCard = newCard;
  }
  const newCardEl = document.getElementById(array);
  const processedCard = convertAceToEleven(convertFaceToTen(newCard));
  if (dealer === true) {
    dealersFirstCard = newCard;
  }
  if (hide === true) {
    hiddenCardId = cardId;
    newCardEl.innerHTML += `<div id="${cardId}" class="card back-red"></div>`;
    setTimeout(function () {
      document.getElementById(`${cardId}`).classList.add('cardDealAnimation');
    }, computerFlowDelay);
    hiddenCardProcessedValue = processedCard;
    hiddenCardDisplay = newCard;
  } else {
    newCardEl.innerHTML += `<div id="${cardId}" class="card ${
      suits[randomSuits()]
    }${ranks[newCard - 1]}"></div>`;
    setTimeout(function () {
      document.getElementById(`${cardId}`).classList.add('cardDealAnimation');
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

// Converts 1 to 11
function convertAceToEleven(newCard) {
  if (newCard === 1) return 11;
  return newCard;
}

// Converts all face cards to 10
function convertFaceToTen(newCard) {
  if (newCard >= 11) return 10;
  return newCard;
}

// Show hidden card
function showHiddenCard() {
  setTimeout(function () {
    document.getElementById(hiddenCardId).classList.add('hiddenCardFlipOne');
  }, computerFlowDelay);

  setTimeout(function () {
    document.getElementById(hiddenCardId).className = `card ${
      suits[randomSuits()]
    }${ranks[hiddenCardDisplay - 1]}`;
    document.getElementById(hiddenCardId).classList.add(`hiddenCardRotated`);
    setTimeout(function () {
      document.getElementById(hiddenCardId).classList.add('hiddenCardFlipTwo');
    }, computerFlowDelay);
  }, cardDealDelay);
}

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
    p: [0],
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
