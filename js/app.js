/*----- constants -----*/
let enabledButtonColor = '#0d331f';
let disabledButtonColor = '#06170e';
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
    'Send it.',
    `One more.`,
    `I'm winning.`,
    `I'll eat your lunch.`,
  ],
  w: [
    `(Win) I owned you.`,
    `(Win) Pay up.`,
    `(Win) Where's my money?`,
    `(Win) Empty your pockets.`,
    `(Win) You smell like bankrupcy.`,
  ],
  l: [
    `(Lose) What in the...?`,
    `(Lose) ...I'm actually broke.`,
    `(Lose) Impossible...`,
    `(Lose) M.I.6 shall pay.`,
    `(Lose) Bill the British taxpayer.`,
  ],
  t: ['(Tie) No way.', '(Tie) Its destiny.'],
  bj: ['(Lose) No f*^%ing way..', '(Win) BLACK JACK BABY!'],
  b: ['(Lose) Ohh ffs...', '(Win) You BUSTED!'],
};

/*----- app's state (variables) -----*/
let firstCard;
let secretCard;
let dealersFirstCard;
let dealersHiddenCard;

let score = {};
let cardSum = {
  d: [0],
  p: [0],
};
let timeDelay = 00;
let playerEndedTurn;

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
  d: document.getElementById('deal'),
  h: document.getElementById('hit'),
  s: document.getElementById('stay'),
};

/*----- event listeners -----*/
document.getElementById('init').addEventListener('click', init);
document.getElementById('deal').addEventListener('click', deal);
document.getElementById('hit').addEventListener('click', hit);
document.getElementById('stay').addEventListener('click', stay);

/*----- functions -----*/
// Page is loaded or Reset button pressed
init();
function init() {
  document.getElementById('dealerSays').textContent =
    dialogues.c[randomDialogue()];
  enableAgainButton();
  disableHitStayButton();
  cardSum = {
    d: [0],
    p: [0],
  };
  score = {
    d: [0],
    p: [0],
  };
  document.getElementById('dealersArray').innerHTML = '';
  document.getElementById('playersArray').innerHTML = '';
  document.getElementById('deal').innerHTML = 'Start';
  render();
}

// Deal is pressed
function deal() {
  firstCard = 0;
  resetScoreBox();
  dealersFirstCard = '';
  dealersHiddenCard = '';
  document.getElementById('playerSays').textContent = '';
  document.getElementById('dealerSays').textContent = '';
  document.getElementById('dealerSays').textContent =
    dialogues.c[randomDialogue()];
  disableAgainButton();
  setTimeout(function () {
    document.getElementById('deal').innerHTML = 'Again';
  }, timeDelay * 4);
  playerEndedTurn = false;
  gameEnded = false;
  cardSum = {
    d: [0],
    p: [0],
  };
  let dealer = true;
  document.getElementById('playersArray').textContent = '';
  document.getElementById('dealersArray').textContent = '';

  setTimeout(function () {
    runDealCard(false, 'dealersArray', cardSum.d, dealer);
    dealer = false;
    setTimeout(function () {
      runDealCard(true, 'dealersArray', cardSum.d);
      console.log(cardSum.d);
      console.log(dealersHiddenCard);
      if (checkForDealerBlackJack()) {
        gameEnded = true;
        score.d++;
        showHiddenCard();
        dealerBlackJack();
        console.log('BlackJack', cardSum.d);
        render();
        disableHitStayButton();
        enableAgainButton();
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
    runDealCard(false, 'playersArray', cardSum.p);
    setTimeout(function () {
      runDealCard(false, 'playersArray', cardSum.p);
      setTimeout(function () {
        render();
        enableHitStayButton();
      }, timeDelay);
    }, timeDelay);
  }, timeDelay);
}

// Player hits
function hit() {
  disableHitStayButton();
  document.getElementById('playerSays').textContent = '';
  document.getElementById('playerSays').textContent =
    dialogues.h[randomDialogue()];
  document.getElementById('dealerSays').textContent = '';
  document.getElementById('dealerSays').textContent =
    dialogues.c[randomDialogue()];
  setTimeout(function () {
    runDealCard(false, 'playersArray', cardSum.p);
    render();
    if (!gameEnded) enableHitStayButton();
  }, timeDelay);
}

// Player stays and ends turn
function stay() {
  playerEndedTurn = true;
  disableHitStayButton();
  enableAgainButton();

  cardSum.d.push(convertFaceToTen(secretCard));
  showHiddenCard();
  render();
  while (!gameEnded && cardSum.d.reduce((a, b) => a + b) < 17) {
    runDealCard(false, 'dealersArray', cardSum.d);
    render();
  }
}

// Render function
function render() {
  let playersSum = cardSum.p.reduce((a, b) => a + b);
  let dealersSum = cardSum.d.reduce((a, b) => a + b);

  //   Hit is pressed
  if (playersSum > 21) {
    gameEnded = true;
    score.d++;
    disableHitStayButton();
    enableAgainButton();
    cardSum.d.push(convertFaceToTen(secretCard));
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
  for (let num in cardSum) {
    sumBox[num].textContent = cardSum[num].reduce((a, b) => a + b);
  }
  for (let num in scoreBox) {
    scoreBox[num].textContent = score[num];
  }
}

// Deal card logic
function runDealCard(hide, array, cardSumArray, dealer) {
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
    secretCard = processedCard;
    dealersHiddenCard = newCard;
  } else {
    newCardEl.innerHTML += `<div class="card ${suits[randomSuits()]}${
      ranks[newCard - 1]
    }"></div>`;
    cardSumArray.push(processedCard);
  }
  checkAndReduceAce(cardSumArray);
  return cardSumArray[cardSumArray.length - 1];
}

// BlackJack check for dealer
function checkForDealerBlackJack() {
  if (firstCard === 1 && dealersHiddenCard >= 11) {
    return true;
  } else if (firstCard >= 11 && dealersHiddenCard === 1) {
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
  }${ranks[dealersHiddenCard - 1]}`;
}

// Reset scorebox after restart
function resetScoreBox() {
  cardSum = {
    d: [0],
    p: [0],
  };
  for (let num in cardSum) {
    sumBox[num].textContent = cardSum[num].reduce((a, b) => a + b);
  }
}

// Dialoge function
function winningDialogueIsPlayer(isTrue) {
  if (isTrue) {
    document.getElementById('playerSays').textContent = '';
    document.getElementById('playerSays').textContent =
      dialogues.w[randomDialogue()];
    document.getElementById('dealerSays').textContent = '';
    document.getElementById('dealerSays').textContent =
      dialogues.l[randomDialogue()];
  } else {
    document.getElementById('playerSays').textContent = '';
    document.getElementById('playerSays').textContent =
      dialogues.l[randomDialogue()];
    document.getElementById('dealerSays').textContent = '';
    document.getElementById('dealerSays').textContent =
      dialogues.w[randomDialogue()];
  }
}
function tieDialogue() {
  document.getElementById('playerSays').textContent = dialogues.t[0];
  document.getElementById('dealerSays').textContent = dialogues.t[1];
}
function dealerBlackJack() {
  document.getElementById('playerSays').textContent = '';
  document.getElementById('playerSays').textContent = dialogues.bj[0];
  document.getElementById('dealerSays').textContent = '';
  document.getElementById('dealerSays').textContent = dialogues.bj[1];
}

function bustedDialogue() {
  document.getElementById('playerSays').textContent = '';
  document.getElementById('playerSays').textContent = dialogues.b[0];
  document.getElementById('dealerSays').textContent = '';
  document.getElementById('dealerSays').textContent = dialogues.b[1];
}

// Button enable/disable
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
