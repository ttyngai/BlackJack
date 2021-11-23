/*----- constants -----*/
let enabledButtonColor = '#0d331f';
let disabledButtonColor = '#06170e';
// dialogues
const dialogues = {
  c: ['Come at me.', 'You sure?', `Don't even try.`, `I warn you.`],
  h: [`How'bout my Aston too?`, 'Send it.', `One more.`, `I'm winning.`],
  w: [
    `(Win) I owned you.`,
    `(Win) Pay up.`,
    `(Win) Where's my money?`,
    `(Win) Empty your pocket.`,
  ],
  l: [
    `(Lose) Wait what?`,
    `(Lose) ..I'm actually broke`,
    `(Lose) Impossible..`,
    `(Lose) M.I.6 shall pay`,
  ],
};

/*----- app's state (variables) -----*/
let score = {};
let cardSum = {
  d: [0],
  p: [0],
};
let timeDelay = 500;
let playerEndedTurn;

/*----- cached element references -----*/
let secretCard;
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

init();

function init() {
  document.getElementById('dealerSays').textContent =
    dialogues.c[randomDialogue()];
  enableDealButton();
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
  render();
}

function deal() {
  document.getElementById('playerSays').textContent = '';
  document.getElementById('dealerSays').textContent = '';
  document.getElementById('dealerSays').textContent =
    dialogues.c[randomDialogue()];
  disableDealButton();
  playerEndedTurn = false;
  gameEnded = false;
  cardSum = {
    d: [0],
    p: [0],
  };
  document.getElementById('playersArray').textContent = '';
  document.getElementById('dealersArray').textContent = '';

  setTimeout(function () {
    runDealCard(false, 'dealersArray', cardSum.d);

    setTimeout(function () {
      runDealCard(true, 'dealersArray', cardSum.d);

      enableHitStayButton();
    }, timeDelay);

    if (cardSum.d.reduce((a, b) => a + b) === 21) {
      document.getElementById('dealersArray').innerHTML = 'BlackJack!';
    }
    render();
  }, timeDelay);
}

function hit() {
  disableHitStayButton();
  document.getElementById('playerSays').textContent = '';
  document.getElementById('playerSays').textContent =
    dialogues.h[randomDialogue()];
  setTimeout(function () {
    runDealCard(false, 'playersArray', cardSum.p);
    render();
    if (!gameEnded) enableHitStayButton();
  }, timeDelay);
}

function stay() {
  playerEndedTurn = true;
  disableHitStayButton();
  enableDealButton();

  cardSum.d[2] = secretCard;

  document.getElementById(
    'dealersArray'
  ).textContent = `${cardSum.d[1]} ${cardSum.d[2]}`;

  render();

  while (!gameEnded && cardSum.d.reduce((a, b) => a + b) < 17) {
    runDealCard(false, 'dealersArray', cardSum.d);
    render();
  }
}

function render() {
  let playerSum = cardSum.p.reduce((a, b) => a + b);
  let dealerSum = cardSum.d.reduce((a, b) => a + b);

  //   while hit is being pressed
  if (playerSum > 21) {
    disableHitStayButton();
    enableDealButton();
    gameEnded = true;
    score.d++;
    winningDialogueIsPlayer(false);
  }
  //   after stay is pressed
  if (!gameEnded && playerEndedTurn) {
    if (dealerSum > 21) {
      gameEnded = true;
      score.p++;
      winningDialogueIsPlayer(true);
    } else if (dealerSum <= 21 && dealerSum > playerSum && dealerSum >= 17) {
      gameEnded = true;
      score.d++;
      winningDialogueIsPlayer(false);
    } else if (playerSum <= 21 && dealerSum >= 17 && dealerSum < playerSum) {
      gameEnded = true;
      score.p++;
      winningDialogueIsPlayer(true);
    }
  }
  if (playerSum === dealerSum && dealerSum >= 17) {
    tieDialogue();
  }
  //   Need to implement TIE logic at 21

  for (let num in cardSum) {
    sumBox[num].textContent = cardSum[num].reduce((a, b) => a + b);
  }
  for (let num in scoreBox) {
    scoreBox[num].textContent = score[num];
  }
  console.log('a', cardSum.d, 'b', cardSum.p, 'c', score.d, 'd', score.p);
}

// Random card from 1-13
function randomCard() {
  return Math.floor(Math.random() * 12 + 1);
}
function randomDialogue() {
  return Math.floor(Math.random() * 4);
}

// Deal card logic
function runDealCard(hide, array, cardSumArray) {
  let newCard = randomCard();
  let newCardEl = document.getElementById(array);
  let aced = displayAce(newCard);
  let faced = convertFaceToLetters(aced);
  let faceToTen = convertFaceToTen(newCard);
  let aceToEleven = convertAceToEleven(faceToTen);
  if (hide === true) {
    newCardEl.append(` # `);
    secretCard = aceToEleven;
  } else {
    newCardEl.append(` ${faced} `);
    cardSumArray.push(aceToEleven);
  }
  checkAndReduceAce(cardSumArray);
  return cardSumArray[cardSumArray.length - 1];
}

// Checks if busted total contains Ace that could be converted from 11 to 1
function checkAndReduceAce(array) {
  if (array.reduce((a, b) => a + b) >= 22 && array.includes(11)) {
    array[array.indexOf(11)] = 1;
  }
  return array;
}

// Converts all 1 to Ace for display
function displayAce(newCard) {
  if (newCard !== 1) return newCard;
  else return 'A';
}

// Converts face cards to letter for display
function convertFaceToLetters(newCard) {
  if (newCard === 11) return 'J';
  else if (newCard === 12) {
    return 'Q';
  } else if (newCard === 13) {
    return 'K';
  }
  return newCard;
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

// Dialoge function
function winningDialogueIsPlayer(boolean) {
  if (boolean) {
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
  document.getElementById('playerSays').textContent = '(Tie) No way.';
  document.getElementById('dealerSays').textContent = '(Tie) Its destiny.';
}

// Button enable/disable
function enableDealButton() {
  buttonStatus.d.disabled = false;
  buttonStatus.d.style.background = enabledButtonColor;
}
function disableDealButton() {
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
