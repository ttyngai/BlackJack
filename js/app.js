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
let cardIdCount = 0;
let maxRound = 7;
let cardDealDelay = 500;
let computerFlowDelay = 50;
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
  r: document.getElementById('reset'),
  d: document.getElementById('again'),
  h: document.getElementById('hit'),
  s: document.getElementById('stay'),
};

/*----- event listeners -----*/
document.getElementById('startMission').addEventListener('click', startMission);
document.getElementById('reset').addEventListener('click', reset);
document.getElementById('again').addEventListener('click', deal);
document.getElementById('hit').addEventListener('click', hit);
document.getElementById('stay').addEventListener('click', stay);

/*----- functions -----*/
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
  document.getElementById('dealerSays').innerHTML =
    dialogues.c[randomDialogue()];
  document.getElementById('playerSays').innerHTML =
    dialogues.h[randomDialogue()];
  render();
  enableAgainButton();
  disableResetButton();
  document.getElementById('again').innerHTML = 'Start';
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
  document.getElementById('playerSays').innerHTML = '';
  document.getElementById('dealerSays').innerHTML = '';
  document.getElementById('dealerSays').innerHTML =
    dialogues.c[randomDialogue()];
  document.getElementById('playerSays').innerHTML =
    dialogues.h[randomDialogue()];
  disableAgainButton();
  setTimeout(function () {
    document.getElementById('again').innerHTML = 'Again';
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
        enableHitStayButton();
        enableResetButton();
        document.getElementById('reset').innerHTML = 'Reset';
      }, cardDealDelay);
    }, cardDealDelay);
  }, cardDealDelay);
}

// Player hits
function hit() {
  disableHitStayButton();
  disableResetButton();
  document.getElementById('playerSays').innerHTML = '';
  document.getElementById('playerSays').innerHTML =
    dialogues.h[randomDialogue()];
  document.getElementById('dealerSays').innerHTML = '';
  document.getElementById('dealerSays').innerHTML =
    dialogues.c[randomDialogue()];
  setTimeout(function () {
    runDealCard(false, 'playersArray', dealtCards.p);
    render();
    if (!gameEnded) enableHitStayButton();
    let playersSum = dealtCards.p.reduce((a, b) => a + b);
    if (playersSum === 21) {
      disableHitButton();
    }
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
  setTimeout(function () {
    dealDealerRemaining();
    enableAgainButton();
    enableResetButton();
  }, cardDealDelay * 1.5);
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
  cardIdCount++;
  if (!hide && dealer) {
    firstCard = newCard;
  }
  const newCardEl = document.getElementById(array);
  const processedCard = convertAceToEleven(convertFaceToTen(newCard));
  if (dealer === true) {
    dealersFirstCard = newCard;
  }
  if (hide === true) {
    hiddenCardId = cardIdCount;
    newCardEl.innerHTML += `<div id="${cardIdCount}" class="card back-red"></div>`;
    setTimeout(function () {
      document
        .getElementById(`${cardIdCount}`)
        .classList.add('cardDealAnimation');
    }, computerFlowDelay);
    hiddenCardProcessedValue = processedCard;
    hiddenCardDisplay = newCard;
  } else {
    newCardEl.innerHTML += `<div id="${cardIdCount}" class="card ${
      suits[randomSuits()]
    }${ranks[newCard - 1]}"></div>`;
    setTimeout(function () {
      document
        .getElementById(`${cardIdCount}`)
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
  document.getElementById(buttonId).classList.remove('buttonBling');
  setTimeout(function () {
    document.getElementById(buttonId).classList.add('buttonBling');
  }, computerFlowDelay);
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
    document.getElementById('playerSays').innerHTML = '';
    document.getElementById('playerSays').innerHTML =
      dialogues.w[randomDialogue()];
    document.getElementById('dealerSays').innerHTML = '';
    document.getElementById('dealerSays').innerHTML =
      dialogues.l[randomDialogue()];
  } else {
    document.getElementById('playerSays').innerHTML = '';
    document.getElementById('playerSays').innerHTML =
      dialogues.l[randomDialogue()];
    document.getElementById('dealerSays').innerHTML = '';
    document.getElementById('dealerSays').innerHTML =
      dialogues.w[randomDialogue()];
  }
}
function tieDialogue() {
  document.getElementById('playerSays').innerHTML = dialogues.t[0];
  document.getElementById('dealerSays').innerHTML = dialogues.t[1];
}
function dealerBlackJack() {
  document.getElementById('playerSays').innerHTML = '';
  document.getElementById('playerSays').innerHTML = dialogues.bj[0];
  document.getElementById('dealerSays').innerHTML = '';
  document.getElementById('dealerSays').innerHTML = dialogues.bj[1];
}

function bustedDialogue() {
  document.getElementById('playerSays').innerHTML = '';
  document.getElementById('playerSays').innerHTML = dialogues.b[0];
  document.getElementById('dealerSays').innerHTML = '';
  document.getElementById('dealerSays').innerHTML = dialogues.b[1];
}

// Button enable/disable
function enableResetButton() {
  buttonStatus.r.disabled = false;
  buttonStatus.r.style.background = enabledButtonColor;
}
function disableResetButton() {
  buttonStatus.r.disabled = true;
  buttonStatus.r.style.background = disabledButtonColor;
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
function enableHitStayButton() {
  buttonStatus.h.disabled = false;
  buttonStatus.h.style.background = enabledButtonColor;
  buttonStatus.s.disabled = false;
  buttonStatus.s.style.background = enabledButtonColor;
  buttonBling('hit');
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
