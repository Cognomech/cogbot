const discord = require("discord.js");

function reactionFilter(clientMessage, userMessage, allowedReactions) {
  const collector = clientMessage.createReactionCollector(() => true);
  collector.on("collect", (reaction) => {
    reaction.users.forEach((user) => {
      if (user instanceof discord.ClientUser) {
        return;
      }
      if ((user === userMessage.author) && (allowedReactions.includes(reaction.emoji.name))) {
        return;
      }
      reaction.remove(user);
    });
  });
  return collector;
}

module.exports.reactYesNoMenu = (client, userMessage, clientMessage, timeout = 30000) => new Promise(async (resolve) => {
  await clientMessage.react("✅");
  await clientMessage.react("❎");

  const filterCollector = reactionFilter(clientMessage, userMessage, ["✅", "❎"]);
  const yesNocollector = clientMessage.createReactionCollector(
    (reaction, user) => ((user === userMessage.author) && (reaction.emoji.name === "✅" || reaction.emoji.name === "❎")),
    {
      max: 1,
      time: timeout,
    }
  );
  yesNocollector.on("end", (collected, reason) => {
    const reaction = collected.first();
    clientMessage.clearReactions();
    filterCollector.stop();
    if (reason === "time" || reaction.emoji.name === "❎") {
      resolve(false);
    }
    resolve(true);
  });
});
