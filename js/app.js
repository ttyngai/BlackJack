/*----- constants -----*/

let enabledButtonColor = '#0d331f';
let disabledButtonColor = '#06170e';
/*----- app's state (variables) -----*/
let score = {};
let cardSum = {
  d: [0],
  p: [0],
};
/*----- cached element references -----*/

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

let secretCard;

/*----- event listeners -----*/

document.getElementById('init').addEventListener('click', init);
document.getElementById('deal').addEventListener('click', deal);
document.getElementById('hit').addEventListener('click', hitPlayer);
document.getElementById('stay').addEventListener('click', endTurn);

/*----- functions -----*/

init();

function init() {
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
  // add function to disable deal button
  cardSum = {
    d: [0],
    p: [0],
  };
  disableDealButton();
  enableHitStayButton();
  document.getElementById('playersArray').textContent = '';
  document.getElementById('dealersArray').textContent = '';

  // run deal cards with parameters set, first parameter is whether card is hidden

  runDealCards(false, 'dealersArray', cardSum.d);

  runDealCards(true, 'dealersArray', cardSum.d);

  if (cardSum.d.reduce((a, b) => a + b) === 21) {
    document.getElementById('dealersArray').innerHTML = 'BlackJack!';
  }

  render();
}

function hitPlayer() {
  console.log('HIT');

  runDealCards(0, 'playersArray', cardSum.p);

  render();
}

function endTurn() {
  console.log('STAY');

  disableHitStayButton();
  enableDealButton();

  cardSum.d[2] = secretCard;

  document.getElementById(
    'dealersArray'
  ).textContent = `${cardSum.d[1]} ${cardSum.d[2]}`;

  render();
  //   runDealCards(0, 'dealersArray', cardSum.d);
  //   render();
}

function render() {
  for (let num in cardSum) {
    sumBox[num].textContent = cardSum[num].reduce((a, b) => a + b);
  }
  if (cardSum.p.reduce((a, b) => a + b) > 21) {
    console.log('Player BUSTED!');
    disableHitStayButton();
    enableDealButton();
    score.d++;
  }
  if (cardSum.d.reduce((a, b) => a + b) > 21) {
    console.log('Dealer BUSTED!');
    score.p++;
  }
  for (let num in scoreBox) {
    scoreBox[num].textContent = score[num];
  }
  console.log(cardSum);
}

// Helper Function
function randomCard() {
  return Math.floor(Math.random() * 12 + 1);
}

// adjust array if anything is 11 and score over 21 turn the first 11 into 1

// Helper function: if array is over 21,
// checks if any arrays is 11(ace),
// converts first one it finds to a 1,
// returns array

function runDealCards(hide, array, cardSumArray) {
  let newCard = randomCard();
  let newCardEl = document.getElementById(array);
  let aceFy = displayAce(newCard);
  let faceFy = convertFaceToLetters(aceFy);
  let faceToTen = convertFaceToTen(newCard);
  let aceToEleven = convertAceToEleven(faceToTen);
  if (hide === true) {
    newCardEl.append(` # `);
    secretCard = aceToEleven;
  } else {
    newCardEl.append(` ${faceFy} `);
    cardSumArray.push(aceToEleven);
  }
  checkAndReduceAce(cardSumArray);

  return cardSumArray[cardSumArray.length - 1];
}

function checkAndReduceAce(array) {
  if (array.reduce((a, b) => a + b) >= 22 && array.includes(11)) {
    array[array.indexOf(11)] = 1;
  }
  return array;
}

// For display, turns any 1(Ace) into the string 1/11
function displayAce(newCard) {
  if (newCard !== 1) return newCard;
  else return 'A';
}

// converts 1 to 11
function convertAceToEleven(newCard) {
  if (newCard === 1) return 11;
  return newCard;
}

// converts face cards to letter for display

function convertFaceToLetters(newCard) {
  if (newCard === 11) return 'J';
  else if (newCard === 12) {
    return 'Q';
  } else if (newCard === 13) {
    return 'K';
  }
  return newCard;
}

// Converts all facecards to number 10
function convertFaceToTen(newCard) {
  if (newCard >= 11) return 10;
  return newCard;
}

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
