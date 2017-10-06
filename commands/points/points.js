const cmdUtils = require("../../cogLib/cmdUtils.js");

module.exports = new cmdUtils.Command({
  name: "points",
},

{
  DMs: false,
  guildIDs: ["277869752867749888"],
},

async (client, message, args) => {
  try {
    const pointsCmd = require(`./${args[0]}.js`);
    args.shift();
    pointsCmd.run(client, message, args);
  } catch (error) {
    if (args[0] === undefined) {
      message.channel.send("No arguments found.");
    } else {
      message.channel.send(`"${args[0]}" is not a recognised sub-command of !points.`);
    }
  }
});

/* TODO: conditions to consider:
  permissions for command
  is user tracked

*/

// TODO: change points command
