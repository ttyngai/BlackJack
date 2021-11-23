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

// const playersArray = document.getElementById('playersArray');
// const dealersArray = document.getElementById('dealersArray');

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
    `(Lose) What the...?`,
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
let timeDelay = 400;
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

let dealersFirstCard;
let dealersHiddenCard;

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

// Deal is pressed
function deal() {
  dealersFirstCard = '';
  dealersHiddenCard = '';
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
  let dealer = true;
  document.getElementById('playersArray').textContent = '';
  document.getElementById('dealersArray').textContent = '';
  setTimeout(function () {
    runDealCard(false, 'dealersArray', cardSum.d, dealer);
    dealer = false;

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

// Player hits
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

// Player stays and ends turn
function stay() {
  playerEndedTurn = true;
  disableHitStayButton();
  enableDealButton();
  cardSum.d[2] = secretCard;

  document.getElementById(
    'dealersArray'
  ).innerHTML = `${cardSum.d[1]} ${cardSum.d[2]}`;

  render();
  while (!gameEnded && cardSum.d.reduce((a, b) => a + b) < 17) {
    runDealCard(false, 'dealersArray', cardSum.d);
    render();
  }
}

// Render function
function render() {
  let playerSum = cardSum.p.reduce((a, b) => a + b);
  let dealerSum = cardSum.d.reduce((a, b) => a + b);

  //   Hit is pressed
  if (playerSum > 21) {
    disableHitStayButton();
    enableDealButton();
    gameEnded = true;
    score.d++;
    winningDialogueIsPlayer(false);
  }

  //   Stay is pressed
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

  for (let num in cardSum) {
    sumBox[num].textContent = cardSum[num].reduce((a, b) => a + b);
  }
  for (let num in scoreBox) {
    scoreBox[num].textContent = score[num];
  }
}

// Random card from 1-13
function randomCard() {
  return Math.floor(Math.random() * 12 + 1);
}
function randomDialogue() {
  return Math.floor(Math.random() * 4);
}
function randomSuits() {
  return Math.floor(Math.random() * 4);
}

// Deal card logic
function runDealCard(hide, array, cardSumArray, dealer) {
  let newCard = randomCard();
  let newCardEl = document.getElementById(array);
  let aced = displayAce(newCard);
  let faced = convertFaceToLetters(aced);
  let faceToTen = convertFaceToTen(newCard);
  let aceToEleven = convertAceToEleven(faceToTen);
  console.log(newCard);
  if (dealer === true) {
    dealersFirstCard = newCard;
  }
  console.log(dealersFirstCard);
  if (hide === true) {
    newCardEl.innerHTML += `<div class="card back-red"></div>`;
    secretCard = aceToEleven;
    dealersHiddenCard = secretCard;
  } else {
    newCardEl.innerHTML += `<div class="card ${suits[randomSuits()]}${
      ranks[newCard - 1]
    }"></div>`;

    // newCardEl.append(` ${faced} `);

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

/*----- constants -----*/

// // Build a 'master' deck of 'card' objects used to create shuffled decks
// const masterDeck = buildMasterDeck();
// renderDeckInContainer(
//   masterDeck,
//   document.getElementById('master-deck-container')
// );

// /*----- app's state (variables) -----*/
// let shuffledDeck;

// /*----- cached element references -----*/
// const shuffledContainer = document.getElementById('shuffled-deck-container');

// /*----- event listeners -----*/
// document
//   .querySelector('button')
//   .addEventListener('click', renderNewShuffledDeck);

// /*----- functions -----*/
// function getNewShuffledDeck() {
//   // Create a copy of the masterDeck (leave masterDeck untouched!)
//   const tempDeck = [...masterDeck];
//   const newShuffledDeck = [];
//   while (tempDeck.length) {
//     // Get a random index for a card still in the tempDeck
//     const rndIdx = Math.floor(Math.random() * tempDeck.length);
//     // Note the [0] after splice - this is because splice always returns an array and we just want the card object in that array
//     newShuffledDeck.push(tempDeck.splice(rndIdx, 1)[0]);
//   }
//   return newShuffledDeck;
// }

// function renderNewShuffledDeck() {
//   // Create a copy of the masterDeck (leave masterDeck untouched!)
//   shuffledDeck = getNewShuffledDeck();
//   renderDeckInContainer(shuffledDeck, shuffledContainer);
// }

// function renderDeckInContainer(deck, container) {
//   container.innerHTML = '';
//   // Let's build the cards as a string of HTML
//   let cardsHtml = '';
//   deck.forEach(function (card) {
//     cardsHtml += `<div class="card ${card.face}"></div>`;
//   });
//   // Or, use reduce to 'reduce' the array into a single thing - in this case a string of HTML markup
//   // const cardsHtml = deck.reduce(function(html, card) {
//   //   return html + `<div class="card ${card.face}"></div>`;
//   // }, '');
//   container.innerHTML = cardsHtml;
// }

// function buildMasterDeck() {
//   const deck = [];
//   // Use nested forEach to generate card objects
//   suits.forEach(function (suit) {
//     ranks.forEach(function (rank) {
//       deck.push({
//         // The 'face' property maps to the library's CSS classes for cards
//         face: `${suit}${rank}`,
//         // Setting the 'value' property for game of blackjack, not war
//         value: Number(rank) || (rank === 'A' ? 11 : 10),
//       });
//     });
//   });
//   return deck;
// }

// renderNewShuffledDeck();
