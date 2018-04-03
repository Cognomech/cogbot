const discord = require("discord.js");
const mathsUtils = require("./mathsUtils.js");

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

module.exports.reactYesNoMenu = (client, userMessage, clientMessageArg, timeout = 30000) => new Promise(async (resolve) => {
  let clientMessage;
  if (typeof clientMessageArg === "string") {
    clientMessage = await userMessage.channel.send(clientMessageArg);
  } else {
    clientMessage = clientMessageArg;
  }

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
  yesNocollector.on("end", async (collected, reason) => {
    const reaction = collected.first();
    await clientMessage.clearReactions();
    filterCollector.stop();
    if (reason === "time" || reaction.emoji.name === "❎") {
      resolve(false);
      return;
    }
    resolve(true);
  });
});


module.exports.reactLeftRightEndMenu = (client, userMessage, clientMessageArg, leftFunc, rightFunc, timeout = 300000) => new Promise(async (resolve) => {
  let clientMessage;
  if (typeof clientMessageArg === "string") {
    clientMessage = await userMessage.channel.send(clientMessageArg);
  } else {
    clientMessage = clientMessageArg;
  }

  const emojis = ["⬅", "🗑", "➡"];
  await clientMessage.react("⬅");
  await clientMessage.react("🗑");
  await clientMessage.react("➡");

  const filterCollector = reactionFilter(clientMessage, userMessage, emojis);
  let responseCollector;

  async function collectorFunc(reaction) {
    if (reaction !== undefined) {
      if (reaction.emoji.name === "🗑") {
        responseCollector.stop("Bin emoji clicked");
        return;
      }
      if (reaction.emoji.name === "⬅") {
        await leftFunc();
      }
      if (reaction.emoji.name === "➡") {
        await rightFunc();
      }
      await reaction.remove(userMessage.author);
      responseCollector.stop();
    }

    responseCollector = clientMessage.createReactionCollector(
      (collected, user) => ((user === userMessage.author) && (emojis.includes(collected.emoji.name))),
      {
        time: timeout,
      }
    );
    responseCollector.on("collect", (response) => {
      collectorFunc(response);
    });
    responseCollector.on("end", async (collected, reason) => {
      if (!(reason === "user")) {
        await clientMessage.clearReactions();
        filterCollector.stop();
        resolve();
      }
    });
  }

  collectorFunc();
});

module.exports.reactNumberedMenu = (client, userMessage, clientMessageArg, funcs, timeout = 300000) => new Promise(async (resolve) => {
  let clientMessage;
  const emojis = [];
  if (typeof clientMessageArg === "string") {
    clientMessage = await userMessage.channel.send(clientMessageArg);
  } else {
    clientMessage = clientMessageArg;
  }
  /* eslint-disable */
  // These NEED to be done in a particular order
  for (let i = 1; i <= funcs.length; i += 1) {
    emojis.push(mathsUtils.numberUnicode[i]);
    await clientMessage.react(mathsUtils.numberUnicode[i]);
  }
  /* eslint-enable */

  const filterCollector = reactionFilter(clientMessage, userMessage, emojis);
  let responseCollector;

  async function collectorFunc(reaction) {
    if (reaction !== undefined && emojis.includes(reaction.emoji.name)) {
      const i = Number.parseInt(reaction.emoji.name.slice(0, 1), 10);
      const requestEnd = funcs[i - 1]();
      await reaction.remove(userMessage.author);
      if (requestEnd) {
        responseCollector.stop("Request End");
        return;
      }
      responseCollector.stop();
    }

    responseCollector = clientMessage.createReactionCollector(
      (collected, user) => ((user === userMessage.author) && (emojis.includes(collected.emoji.name))),
      {
        time: timeout,
      }
    );
    responseCollector.on("collect", (response) => {
      collectorFunc(response);
    });
    responseCollector.on("end", async (collected, reason) => {
      if (!(reason === "user")) {
        clientMessage.clearReactions();
        if (reason === "time") {
          clientMessage.delete();
          userMessage.delete();
        }
        filterCollector.stop();
        resolve();
      }
    });
  }

  collectorFunc();
});
