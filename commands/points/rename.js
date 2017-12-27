const cmdUtils = require("../../cogLib/cmdUtils.js");
const sqlite = require("sqlite");
const rankUtils = require("../../cogLib/rankUtils.js");

module.exports = new cmdUtils.HelperCommand(
  require("./points.js"),

  {
    name: "rename",
  },

  {
    roleIDs: ["277880534561062912", "298843020558598154"],
  },

  async (client, message, args) => {
    const oldName = args[0];
    const newName = args[1];

    if (args.length !== 2) {
      message.channel.send("Expected format: !points rename [old name] [new name]");
      return;
    }

    const db = await sqlite.open("databases/points.db");


    let testEntry = await db.get(`SELECT name name, points points FROM main WHERE name = "${oldName}"`);
    if (!testEntry) {
      message.channel.send(`Could not find ${oldName}`);
      await db.close();
      return;
    }
    testEntry = await db.get(`SELECT name name, points points FROM main WHERE name = "${newName}"`);
    if (testEntry) {
      message.channel.send(`${newName} is already being tracked.`);
      await db.close();
      return;
    }

    await db.run(`UPDATE main SET name = "${newName}" WHERE name = "${oldName}"`);
    await db.run(`ALTER TABLE "${oldName}" RENAME TO "${newName}"`);
    await db.close();
    message.channel.send(`${oldName} successfully renamed to ${newName}`);

    await rankUtils.update(client.guilds.get("277869752867749888"), "databases/points.db");
  }
);
