const cmdUtils = require("../../cogLib/cmdUtils.js");
const sqlite = require("sqlite");

module.exports = new cmdUtils.HelperCommand(
  require("./points.js"),

  {
    name: "check",
  },

  {},

  async (client, message, args) => {
    const username = args[0];

    if (args.length !== 1) {
      message.channel.send("Expected format: !points check [username]");
      return;
    }

    const db = await sqlite.open("databases/points.db");
    await db.run("CREATE TABLE IF NOT EXISTS main(name text PRIMARY KEY, points integer CHECK (points >= 0))");

    const entry = await db.get(`SELECT name name, points points FROM main WHERE name = "${username}"`);
    if (!entry) {
      message.channel.send(`Could not find ${username}`);
    } else {
      message.channel.send(`${username} has ${entry.points} points.`);
    }

    db.close();
  }
);
