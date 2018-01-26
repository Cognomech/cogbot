const cmdUtils = require("../../cogLib/cmdUtils.js");
const sqlite = require("sqlite");

module.exports = new cmdUtils.Command({
  name: "quotes",
},

{
  DMs: false
},

async (client, message, args) => {
  const cmdName = args[0];
  args.shift();
  const db = await sqlite.open("./databases/quotes.db");
  try {
    await db.get(`
      SELECT guildID guildID
      FROM main
      WHERE guildID = ${message.guild.id}
    `);
  } catch (error) {
    if (cmdName !== "enable") {
      message.channel.send("Quote Board not enabled in this guild. Use **!quotes enable** to enable the Quote Board.");
      return;
    }
  } finally {
    db.close();
  }

  try {
    const cmd = require(`./${cmdName}.js`);
    cmd.run(client, message, args);
  } catch (error) {
    if (args[0] === undefined) {
      message.channel.send("No arguments found.");
    } else {
      message.channel.send(`"${cmdName}" is not a recognised sub-command of !quotes.`);
    }
  }
});
