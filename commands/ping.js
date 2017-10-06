const cmdUtils = require("../cogLib/cmdUtils.js");

module.exports = new cmdUtils.Command(
  {
    name: "ping",
  },

  {},

  (client, message) => {
    message.channel.send(`Pong: ${new Date().getTime() - message.createdTimestamp} ms`);
  }
);
