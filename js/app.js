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
  //   scores.p++;
  let newCard = randomCard();

  let newCardEl = document.getElementById('playerArray');
  console.log(newCard, newCardEl);
  let acefy;
  if (newCard !== 1) {
    acefy = newCard;
  } else {
    acefy = '1/11';
  }
  newCardEl.append(` ${acefy} `);

  scores.p.push(newCard);

  console.log(scores.p);
  if (scores.p > 21) {
    console.log('Stop!');
  }
  render();
}

function endTurn() {
  console.log('STAY');
  render();
}

function render() {
  for (let score in scores) {
    scoreBox[score].textContent = scores[score].reduce(function (a, b) {
      return a + b;
    });
  }
}

// Helper Function
function randomCard() {
  return Math.floor(Math.random() * 12 + 1);
}
console.log(randomCard());
