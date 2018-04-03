const suits = ["♠", "♥", "♦", "♣"];

function randomIntInc(min, max) {
  return Math.floor(Math.random() * ((max - min) + 1)) + min;
}

class Card {
  constructor(value, suit) {
    this.value = value;
    this.suit = suit;
    this.string = value + suit;
  }
}

module.exports.Deck = class Deck {
  constructor(cards) {
    this.cards = cards;
    this.size = cards.length;
    this.string = cards.map(val => val.string).join(" - ");
  }

  drawCards(num) {
    for (let i = 0; i < num; i += 1) {
      const card = module.exports.drawCard();
      this.cards.push(card);
      this.string = this.cards.map(val => val.string).join(" - ");
    }
  }
};

module.exports.drawCard = function drawCard(number) {
  let num;
  if (number === undefined) {
    num = randomIntInc(0, 51);
  } else {
    num = number;
  }
  const suit = suits[Math.floor(num / 13)];
  let val = num % 13;
  switch (val) {
    case 0:
      val = "**A**";
      break;
    case 10:
      val = "**J**";
      break;
    case 11:
      val = "**Q**";
      break;
    case 12:
      val = "**K**";
      break;
    default:
      val = `**${(val + 1)}**`;
  }
  return new Card(val, suit);
};

module.exports.drawDeck = function drawDeck(num) {
  const cards = [];
  for (let i = 0; i < num; i += 1) {
    cards[i] = module.exports.drawCard();
  }
  return new module.exports.Deck(cards);
};
