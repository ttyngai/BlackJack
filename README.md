## **CASINO 7 - NO TIME TO BUST**

Game of BlackJack with Jame's Bond Theme. The story is situated at the movie Casino Royale, so naturally the responses would be subtitles just like you are watching a movie.

The game is coded for Dealer's BlackJack condition only for Ace with facecards(Not 10). If this condition is triggered it is an automatic win for the dealer. This is not true for the players, hence the game is sided slightly towards the dealer, as real casinos are designed. Dealer also will hit any hands under 17.

Major challenge was the hidding of the second card but simultaneously having it's value stored and showing an SVG with the backside. After the game is complete, the card's value is checked and processed for any facecard to changed to numeric 10, as well as any Ace card to 11.

On top of this, the code will check for hands that are over 21, but contains an Ace in which it could reduce to 1. This reduction function is called before checking for any busts.

**This game is sized for desktop and mobile phone screen sized. The breakpoint is set to 800px**

### **Gameplay Screenshots:**

![Game of BlackJack](https://i.imgur.com/QsyVWtP.png 'ScreenShot of Gameplay')

**Tehcnologies used:**

- CSS
- HTML
- Javascript.

**Please click this link to start the game:**

https://ttyngai.github.io/BlackJack/

**Future improvements in the future would be to add bank account and split/double functions.**
