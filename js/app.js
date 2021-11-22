/*----- constants -----*/

/*----- app's state (variables) -----*/
let scores = {
  d: [],
  p: [],
};
/*----- cached element references -----*/
let scoreBox = {
  d: document.getElementById('dealerScoreBox'),
  p: document.getElementById('playerScoreBox'),
};

/*----- event listeners -----*/

document.getElementById('newRound').addEventListener('click', init);
document.getElementById('hit').addEventListener('click', hitPlayer);
document.getElementById('stay').addEventListener('click', endTurn);

/*----- functions -----*/

init();

function init() {
  console.log('new round');
  scores = {
    d: [0],
    p: [0],
  };
  let newCardEl = document.getElementById('playerArray');
  newCardEl.textContent = '';

  render();
}

function hitPlayer() {
  console.log('HIT');
  let newCard = randomCard();
  let newCardEl = document.getElementById('playerArray');
  let aceFy = convertAceToOneEleven(newCard);
  let faceFy = convertFaceToLetters(aceFy);
  newCardEl.append(` ${faceFy} `);
  let faceToTen = convertFaceToTen(newCard);
  scores.p.push(faceToTen);
  checkAndReduceAce(scores.p);

  render();
}

function endTurn() {
  console.log('STAY');
  render();
}

function render() {
  for (let score in scores) {
    scoreBox[score].textContent = scores[score].reduce((a, b) => a + b);
  }
  if (scores.p.reduce((a, b) => a + b) > 21) {
    console.log('BUSTED!');
  }
}

// Helper Function
function randomCard() {
  return Math.floor(Math.random() * 12 + 1);
}
console.log(randomCard());

// adjust array if anything is 11 and score over 21 turn the first 11 into 1

// Helper function: if array is over 21,
// checks if any arrays is 11(ace),
// converts first one it finds to a 1,
// returns array

function checkAndReduceAce(array) {
  if (array.reduce((a, b) => a + b) >= 22 && array.includes(11)) {
    array[array.indexOf(11)] = 1;
  }
  return array;
}

// For display, turns any 1(Ace) into the string 1/11
function convertAceToOneEleven(newCard) {
  if (newCard !== 1) return newCard;
  else return 'A';
}

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
  if (newCard >= 11) {
    return 10;
  } else return newCard;
}
