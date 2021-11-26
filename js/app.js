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
  playerEndedTurn;
let score = {};
let dealtCards = {
  d: [0],
  p: [0],
};
let timeDelay = 250;

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
  i: document.getElementById('reset'),
  d: document.getElementById('again'),
  h: document.getElementById('hit'),
  s: document.getElementById('stay'),
};

/*----- event listeners -----*/
document.getElementById('reset').addEventListener('click', reset);
document.getElementById('again').addEventListener('click', deal);
document.getElementById('hit').addEventListener('click', hit);
document.getElementById('stay').addEventListener('click', stay);

/*----- functions -----*/
init();
function init() {
  disableHitStayButton();
  disableInitButton();
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
  disableInitButton();
  document.getElementById('again').innerHTML = 'Start';
}

// Deal is pressed
function deal() {
  disableInitButton();
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
  }, timeDelay * 4);
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
        showHiddenCard();
        dealerBlackJack();
        render();
        disableHitStayButton();
        enableAgainButton();
        enableInitButton();
      }
      if (!gameEnded) {
        dealPlayer();
        render();
      }
    }, timeDelay);
  }, timeDelay);
}
function dealPlayer() {
  setTimeout(function () {
    runDealCard(false, 'playersArray', dealtCards.p);
    setTimeout(function () {
      runDealCard(false, 'playersArray', dealtCards.p);
      setTimeout(function () {
        render();
        enableHitStayButton();
        enableInitButton();
        document.getElementById('init').innerHTML = 'Reset';
      }, timeDelay);
    }, timeDelay);
  }, timeDelay);
}

// Player hits
function hit() {
  disableHitStayButton();
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
  }, timeDelay);
}

// Player stays and ends turn
function stay() {
  playerEndedTurn = true;
  dealtCards.d.push(convertAceToEleven(convertFaceToTen(hiddenCardDisplay)));
  showHiddenCard();
  checkAndReduceAce(dealtCards.d);
  checkAndReduceAce(dealtCards.p);
  disableHitStayButton();
  enableAgainButton();
  render();
  while (!gameEnded && dealtCards.d.reduce((a, b) => a + b) < 17) {
    runDealCard(false, 'dealersArray', dealtCards.d);
    render();
  }
}

// Render function
function render() {
  let playersSum = dealtCards.p.reduce((a, b) => a + b);
  let dealersSum = dealtCards.d.reduce((a, b) => a + b);

  //   Hit is pressed
  if (playersSum > 21) {
    gameEnded = true;
    score.d++;
    disableHitStayButton();
    enableAgainButton();
    dealtCards.d.push(convertAceToEleven(hiddenCardProcessedValue));
    showHiddenCard();
    bustedDialogue();
  }
  //   Stay is pressed
  if (!gameEnded && playerEndedTurn) {
    if (dealersSum > 21) {
      gameEnded = true;
      score.p++;
      winningDialogueIsPlayer(true);
    } else if (
      dealersSum <= 21 &&
      dealersSum > playersSum &&
      dealersSum >= 17
    ) {
      gameEnded = true;
      score.d++;
      winningDialogueIsPlayer(false);
    } else if (
      playersSum <= 21 &&
      dealersSum >= 17 &&
      dealersSum < playersSum
    ) {
      gameEnded = true;
      score.p++;
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
  if (!hide && dealer) {
    firstCard = newCard;
  }
  const newCardEl = document.getElementById(array);
  const processedCard = convertAceToEleven(convertFaceToTen(newCard));
  if (dealer === true) {
    dealersFirstCard = newCard;
  }
  if (hide === true) {
    newCardEl.innerHTML += `<div id="hiddenCard" class="card back-red"></div>`;
    hiddenCardProcessedValue = processedCard;
    hiddenCardDisplay = newCard;
  } else {
    newCardEl.innerHTML += `<div class="card ${suits[randomSuits()]}${
      ranks[newCard - 1]
    }"></div>`;
    dealtCardsArray.push(processedCard);
  }
  checkAndReduceAce(dealtCardsArray);
  return dealtCardsArray[dealtCardsArray.length - 1];
}

// BlackJack check for dealer
function checkForDealerBlackJack() {
  if (firstCard === 1 && hiddenCardDisplay >= 11) {
    dealtCards.d.push(convertAceToEleven(hiddenCardDisplay));
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
  document.getElementById('hiddenCard').className = `card ${
    suits[randomSuits()]
  }${ranks[hiddenCardDisplay - 1]}`;
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
function enableInitButton() {
  buttonStatus.i.disabled = false;
  buttonStatus.i.style.background = enabledButtonColor;
}
function disableInitButton() {
  buttonStatus.i.disabled = true;
  buttonStatus.i.style.background = disabledButtonColor;
}
function enableAgainButton() {
  buttonStatus.d.disabled = false;
  buttonStatus.d.style.background = enabledButtonColor;
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
