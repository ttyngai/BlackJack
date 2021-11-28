## **CASINO 7 - NO TIME TO BUST**

Game of BlackJack with James Bond Theme. The story is situated at the movie Casino Royale, so naturally the responses would be subtitles just like you are watching a movie.

The game is coded for dealer's "BlackJack" condition only for ace with facecards(not 10, as per convention). As a result code needs to differentiate between a 10 card, and facecard with value also as 10! - a coding beginner's nightmare! If this condition is triggered it is an automatic win for the dealer. This is not true for the players(again as per convention), hence the game is sided slightly towards the dealer, as real casinos are designed. Dealer also will hit any hands under 17.

At the end card's value is checked and processed for any facecard to changed to numeric 10, as well as any ace card to 11. On top of this, the code will check for hands that are over 21, but contains an ace in which it could reduce to 1. This reduction function is called before checking for any busts.

A major challenge was to animate cards dealt and assigning `id` to track which one to animate with a `setTimeout()` function, since javascript does not animate when class is initially added.

An even bigger challenge was to have the second hidden card simultaneously store it's numeric value and showing an SVG with the backside. The backside card element `<div>` generated carries a unique `id` generated. When hands are to be shown, the code applies the animation to flip the downwards facing card halfway `scaleX()`, while finds and swaps the facecard `<div>` carrying the corresponding `id`, applies the correct animation classes again to show the card being flipped back, and showing the correct SVG.

With `setTimeout()` functions to simulate some delays, I also needed to make sure buttons can't be pressed again during timeout. Hence there is a block of code to manage button enable/disable with corresponding color change.

Bonus: Autopilot mode required careful nesting of `setTimeout()` in order for calculations and animations to work properly.

**This game is sized for both desktop and mobile phone screens. The breakpoint is set to 800px**

### **Gameplay Screenshots:**

![Game of BlackJack](https://i.imgur.com/QsyVWtP.png 'ScreenShot of Gameplay')

**Tehcnologies used:**

- CSS
- HTML
- Javascript.

**Please click this link to start the game:**

https://ttyngai.github.io/BlackJack/

**Future improvements in the future would be to add bank account and split/double functions.**
