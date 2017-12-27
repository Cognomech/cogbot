const cmdUtils = require("../cogLib/cmdUtils.js");
const clientUtils = require("../cogLib/clientUtils.js");
const sqlite = require("sqlite");

module.exports = new cmdUtils.Command({
  name: "setrsname",
},

{
  DMs: false,
  guildIDs: ["277869752867749888"],
  roleIDs: ["277880534561062912", "298843020558598154"],
},

async (client, message, args) => {
  const discordArg = args[0];
  const rsName = args[1];
  const albionGuild = message.guild;
  let id;
  let discordName;
  let conflictingDiscordName;
  let currentRSName;

  if (args.length !== 2) {
    message.channel.send("Expected format: !setrsname [MentionedUser/ID] [RSName]");
  }
  if (discordArg.startsWith("<@") && discordArg.endsWith(">")) {
    id = discordArg.slice(2, -1);
  } else {
    id = discordArg;
  }
  discordName = albionGuild.members.get(id).nickname;
  if (discordName === undefined || discordName === null) {
    discordName = albionGuild.members.get(id).user.username;
  }

  if (!albionGuild.members.has(id)) {
    message.channel.send(`Could not find user in guild with ID: ${id}`);
    return;
  }

  const db = await sqlite.open("databases/points.db");
  await db.run(`
    CREATE TABLE IF NOT EXISTS
    rsnames (
      id text PRIMARY KEY,
      rsname text UNIQUE
    )
  `);

  const data = await db.all(`
    SELECT
    id id,
    rsname rsname
    FROM rsnames
    WHERE rsname = "${rsName}"
    OR id = "${id}"
  `);

  if (data.length === 2) {
    data.forEach((row) => {
      if (row.id === id) {
        currentRSName = row.rsname;
      } else {
        conflictingDiscordName = albionGuild.members.get(row.id).nickname;
        if (conflictingDiscordName === undefined || discordName === null) {
          conflictingDiscordName = albionGuild.members.get(row.id).user.username;
        }
      }
    });
    message.channel.send(`${discordName} currently has the RuneScape name ${currentRSName}, and the RuneScape name ${rsName} is currently taken by ${conflictingDiscordName}.`);
  }

  if (data.length === 1 && data[0].id === id) {
    if (rsName === data[0].rsname) {
      message.channel.send(`${discordName} already has ${rsName} as their RuneScape name.`);
    } else {
      const clientMessage = await message.channel.send(`${discordName} currently has the RuneScape name ${data[0].rsname}. Would you like to overwrite this?`);
      const requestOverwrite = await clientUtils.reactYesNoMenu(client, message, clientMessage);
      if (requestOverwrite) {
        db.run(`
          UPDATE rsnames
          SET rsname = "${rsName}"
          WHERE id = "${id}"
      `);
        message.channel.send(`${discordName} has successfully had their RuneScape name changed from ${data[0].rsname} to ${rsName}.`);
      }
    }
  }

  if (data.length === 1 && data[0].rsname === rsName) {
    conflictingDiscordName = albionGuild.members.get(data[0].id).nickname;
    if (conflictingDiscordName === undefined) {
      conflictingDiscordName = albionGuild.members.get(data[0].id).user.username;
    }
    message.channel.send(`The RuneScape name ${rsName} is currently in use by ${conflictingDiscordName}.`);
  }

  if (data.length === 0) {
    db.run(`
      INSERT INTO rsnames
      (id, rsname)
      VALUES
      ("${id}", "${rsName}")
    `);
    message.channel.send(`${discordName} has successfully been assigned the RuneScape name ${rsName}.`);
  }

  db.close();
});
