const config = require("../config.json");

module.exports = (client, message) => {
  const cmdRegistry = client.cmdHandler.cmdRegistry;

  if (!message.content.startsWith(config.prefix)) {
    return;
  }
  if (message.author.bot) {
    return;
  }

  const args = [];
  const regEx = /"(.*?)"|(\S+)/g;
  let match = regEx.exec(message.content);
  while (match) {
    args.push(match[1] ? match[1] : match[0]);
    match = regEx.exec(message.content);
  }
  const cmdName = args.shift().slice(1).toLowerCase();

  if (!cmdRegistry.has(cmdName)) {
    return;
  }
  const cmd = cmdRegistry.get(cmdName);
  cmd.run(client, message, args);
};
