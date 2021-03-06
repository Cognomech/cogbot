const cmdUtils = require("../../cogLib/cmdUtils.js");
const sqlite = require("sqlite");
const clientUtils = require("../../cogLib/clientUtils.js");
const rankUtils = require("../../cogLib/rankUtils.js");

async function addLog(db, username, points, reason, author) {
  const epochTime = Date.now();
  const readableTime = new Date().toUTCString();

  await db.run(`CREATE TABLE IF NOT EXISTS [${username}] (epochTime integer PRIMARY KEY, readableTime text, pointsChange integer, log text, author text)`);
  await db.run(`INSERT INTO [${username}] (epochTime, readableTime, pointsChange, log, author) VALUES (${epochTime}, "${readableTime}", ${points}, "${reason}", "${author}")`);
}

module.exports = new cmdUtils.HelperCommand(
  require("./points.js"),

  {
    name: "change",
  },

  {
    roleIDs: ["277880534561062912", "298843020558598154"],
  },

  async (client, message, args) => {
    const username = args[0];
    const value = parseInt(args[1], 10);
    const reason = args[2];

    if (args.length !== 3) {
      message.channel.send("Expected format: !points change [name] [value] [reason]");
      return;
    }
    if (Number.isNaN(value)) {
      message.channel.send("Expected number for value argument.");
      return;
    }
    if (value === 0) {
      message.channel.send("You cannot make a change of zero points.");
      return;
    }
    if (reason.length > 200) {
      message.channel.send("Reason cannot exceed 200 characters.");
      return;
    }

    const db = await sqlite.open("databases/points.db");
    await db.run("CREATE TABLE IF NOT EXISTS main(name text PRIMARY KEY, points integer CHECK (points >= 0))");

    const mainEntry = await db.get(`SELECT name name, points points FROM main WHERE name = "${username}"`);
    if (!mainEntry) {
      if (value < 0) {
        message.channel.send(`You cannot subtract points from ${username} since they are not currently being tracked.`);
        return;
      }

      const clientMessage = await message.channel.send(`${username} is not currently being tracked. Would you like to begin tracking?`);
      const requestTracking = await clientUtils.reactYesNoMenu(client, message, clientMessage);
      if (requestTracking) {
        await db.run(`INSERT INTO main (name, points) VALUES ("${username}", ${value})`);
        await addLog(db, username, value, reason, message.author.username);
        await message.channel.send(`${username} is now being tracked and had been awarded ${value} points for: ${reason}`);
      }
    } else {
      const currentPoints = (await db.get(`SELECT points points FROM main WHERE name = "${username}"`)).points;
      const newPoints = +currentPoints + +value;
      if (newPoints < 0) {
        message.channel.send(`This would result in a negative point value. ${username} currently has ${currentPoints} points.`);
        return;
      }

      await db.run(`UPDATE main SET points = ${newPoints} WHERE name = "${username}"`);
      await addLog(db, username, value, reason, message.author.username);
      await message.channel.send(`${username} now has ${newPoints} points after a change of ${value} for: ${reason}`);
    }
    await db.close();

    await rankUtils.update(client.guilds.get("277869752867749888"), "databases/points.db");
  }
);
