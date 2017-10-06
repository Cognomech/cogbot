const discord = require("discord.js");
const cmdUtils = require("./cogLib/cmdUtils.js");
const config = require("./config.json");
const eventUtils = require("./cogLib/eventUtils.js");

const client = new discord.Client();
client.cmdHandler = new cmdUtils.CommandHandler(`${__dirname}/commands`);
client.eventHandler = new eventUtils.EventHandler(client, `${__dirname}/events`);

(async () => {
  await Promise.all([
    client.cmdHandler.registerCmdsFromDir(),
    client.eventHandler.registerEventsFromDir()
  ]);
  await client.login(config.token);
})();

