const cmdUtils = require("../../cogLib/cmdUtils.js");
const clientUtils = require("../../cogLib/clientUtils.js");

module.exports = new cmdUtils.HelperCommand(
  require("./bj.js"),

  {
    name: "forfeit",
  },

  {},

  async (client, message) => {
    if (client.cache.bj === undefined) {
      client.cache.bj = [];
    }
    const entry = client.cache.bj.find(testEntry => testEntry.authorID === message.author.id);
    const index = client.cache.bj.findIndex(testEntry => testEntry.authorID === message.author.id);
    if (entry) {
      const confirmation = await clientUtils.reactYesNoMenu(client, message, "Are you sure you wish to forfeit your current blackjack game? Your bet will not be returned.");
      if (confirmation) {
        entry.message.delete();
        message.channel.send("Your current blackjack game has now been forfeited.");
        client.cache.bj.splice(index, 1);
      }
    } else {
      message.channel.send("You do not have a blackjack game in progress.");
    }
  }
);
