const discord = require("discord.js");

module.exports.reactYesNoMenu = (client, userMessage, clientMessageText, timeout = 30000) => new Promise(async (resolve) => {
  const clientMessage = await userMessage.channel.send(clientMessageText);
  await clientMessage.react("✅");
  await clientMessage.react("❎");

  const allCollector = clientMessage.createReactionCollector(() => true);
  allCollector.on("collect", (reaction) => {
    reaction.users.forEach((user) => {
      if (user instanceof discord.ClientUser) {
        return;
      }
      if ((user === userMessage.author) && (reaction.emoji.name === "✅" || reaction.emoji.name === "❎")) {
        return;
      }
      reaction.remove(user);
    });
  });

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
    allCollector.stop();
    if (reason === "time" || reaction.emoji.name === "❎") {
      resolve(false);
    }
    resolve(true);
  });
});
