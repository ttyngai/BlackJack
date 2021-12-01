## **CASINO 7 - NO TIME TO BUST**

Game of BlackJack with James Bond Theme. The story is situated at the movie Casino Royale, the win/loss responses would be subtitles just like you are watching a movie.

The game is coded for dealer's "BlackJack" condition only for ace with facecards(not 10, as per convention). As a result code needs to differentiate between a 10 card, and facecard with value also as 10. If this condition is triggered it is an automatic win for the dealer. This is not true for the players(again as per convention), hence the game is sided slightly towards the dealer, as real casinos are designed. Dealer also will hit any hands under 17.

The game has split and double function as well. When player receives first two cards with the same rank, it will split into two rows. The card is tracked with its generated ID, and transfered into the new row.

At the end card's value is checked and processed for any facecard to changed to numeric 10, as well as any ace card to 11. On top of this, the code will check for hands that are over 21 and contains an ace in which it could reduce 11 to 1. This reduction function is called before checking for any busts.

A major challenge was to animate cards dealt and assigning `id` to track which one to animate with a `setTimeout()` function, since javascript does not animate when class is initially added.

An even bigger challenge was to have the second hidden card simultaneously store it's numeric value and showing an SVG with the backside. The backside card element `<div>` generated carries a unique `id` generated. When hands are to be shown, the code applies the animation to flip the downwards facing card halfway `scaleX()`, while finds and swaps the facecard `<div>` carrying the corresponding `id`, applies the correct animation classes again to show the card being flipped back, and showing the correct SVG.

With `setTimeout()` functions to simulate some delays, I also needed to make sure buttons can't be pressed again during timeout. Hence there is a block of code to manage button enable/disable with corresponding color change.

**BONUS: This game is sized for both desktop and mobile phone screens. The breakpoint is set to 800px**

**BONUS #2: There is a HELP button in which Bond will help you choose the action that has highest probability of winning. This is based on "perfect blackjack strategies" without soft ACE rules**

**BONUS #3: Autopilot mode required careful timing in order for animations to work properly.**

### **Gameplay Screenshots:**

![Game of BlackJack](https://i.imgur.com/QsyVWtP.png 'ScreenShot of Gameplay')

**Tehcnologies used:**

- CSS
- HTML
- Javascript.

**Please click this link to start the game:**

https://ttyngai.github.io/BlackJack/

**Future improvements in the future would be to add bank account functions. Also can have 3D viewports would be quiet cool. Could also imporve on soft ACE rule**
