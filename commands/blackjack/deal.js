const cmdUtils = require("../../cogLib/cmdUtils.js");
const gambleUtils = require("../../cogLib/gambleUtils.js");
const discord = require("discord.js");
const messageUtils = require("../../cogLib/messageUtils.js");
const clientUtils = require("../../cogLib/clientUtils.js");

function bjTotal(deck) {
  const cardVals = deck.cards.map(card => card.value.slice(2, -2));

  function cardCount(soft) {
    const cardValsCopy = cardVals;
    cardValsCopy.forEach((val, i) => {
      switch (val) {
        case "A":
          if (soft) {
            cardValsCopy[i] = 11;
          } else {
            cardValsCopy[i] = 1;
          }
          break;
        case "J":
        case "Q":
        case "K":
          cardValsCopy[i] = 10;
          break;
        default:
          cardValsCopy[i] = Number.parseInt(cardValsCopy[i], 10);
          break;
      }
    });
    return cardValsCopy.reduce((accumulator, current) => accumulator + current);
  }
  let total = cardCount(true);
  if (total > 21) {
    total = cardCount(false);
    return total;
  }
  return total;
}

function hasBlackjack(deck) {
  if ((deck.size === 2) && bjTotal(deck) === 21) return true;
  return false;
}

function hasBust(deck) {
  if (bjTotal(deck) > 21) return true;
  return false;
}


module.exports = new cmdUtils.HelperCommand(
  require("./bj.js"),

  {
    name: "deal",
  },

  {},

  async (client, message) => {
    if (client.cache.bj === undefined) {
      client.cache.bj = [];
    }

    if (client.cache.bj.find(entry => entry.authorID === message.author.id)) {
      message.channel.send("You already have a blackjack game in progress. Please finish your current game or use **!bj forfeit** to forfeit it.");
      return;
    }

    const playerDeck = gambleUtils.drawDeck(2);
    const dealerDeck = gambleUtils.drawDeck(2);
    function createBjEmbed(result) {
      let dealerString;
      let footer;
      if (result !== null) {
        dealerString = dealerDeck.string;
        footer = result;
      } else {
        footer = "Player's turn.";
        dealerString = `${dealerDeck.string.substring(0, dealerDeck.string.indexOf("-"))}- **??**`;
      }

      const embed = new discord.MessageEmbed();
      embed.addField("Info", "[1] - Hit\n[2] - Stand\n[3] - Double Down(COMING SOON)\n[4] - Split(COMING SOON)\n[5] - Surrender(COMING SOON)\n ")
        .addField("Player", playerDeck.string, true)
        .addField("Dealer", dealerString, true)
        .setAuthor(messageUtils.authorName(message), message.author.avatarURL())
        .setColor(0xaf00ff)
        .setDescription("__**Blackjack** - *Dealer stands on all 17*__")
        .setFooter(footer);
      return embed;
    }
    const clientMessage = await message.channel.send(createBjEmbed(null));
    client.cache.bj.push(
      {
        authorID: message.author.id,
        message: clientMessage
      });

    function hit() {
      playerDeck.drawCards(1);
      if (hasBust(playerDeck)) {
        clientMessage.edit(createBjEmbed("Player busts, dealer wins."));
        return true;
      }
      clientMessage.edit(createBjEmbed(null));
      return false;
    }
    function stand() {
      while (bjTotal(dealerDeck) < 17) {
        dealerDeck.drawCards(1);
      }
      if (bjTotal(dealerDeck) > 21) {
        clientMessage.edit(createBjEmbed("Dealer busts, player wins."));
      } else if (bjTotal(playerDeck) > bjTotal(dealerDeck)) {
        clientMessage.edit(createBjEmbed("Player total beats dealer total, player wins."));
      } else {
        clientMessage.edit(createBjEmbed("Dealer total beats player total, dealer wins."));
      }
      return true;
    }
    const funcs = [
      hit,
      stand
    ];

    if (hasBlackjack(dealerDeck)) {
      clientMessage.edit(createBjEmbed("Dealer wins with blackjack."));
    } else if (hasBlackjack(playerDeck)) {
      clientMessage.edit(createBjEmbed("Player wins with blackjack."));
    } else {
      await clientUtils.reactNumberedMenu(client, message, clientMessage, funcs);
    }
    try {
      message.delete({ timeout: 30000 });
      clientMessage.delete({ timeout: 30000 });
    } finally {
      const index = client.cache.bj.findIndex(testEntry => testEntry.authorID === message.author.id);
      client.cache.bj.splice(index, 1);
    }
  }
);
