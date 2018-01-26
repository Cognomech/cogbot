const cmdUtils = require("../../cogLib/cmdUtils.js");
const sqlite = require("sqlite");

module.exports = new cmdUtils.HelperCommand(
  require("./quotes.js"),

  {
    name: "enable",
  },

  {},

  async (client, message) => {
    const guildId = message.guild.id;
    const db = await sqlite.open("./databases/quotes.db");
    let qbChannel;

    await db.run(`
      CREATE TABLE IF NOT EXISTS
      main (
       guildID text PRIMARY KEY,
       channelID text
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS
      "${guildId}" (
       messageID text PRIMARY KEY,
       author text,
       image text,
       body text,
       adder text,
       time text
      )
    `);

    if (message.guild.channels.exists("name", "quoteboard")) {
      message.channel.send("Quote Board already exists.");
    } else {
      qbChannel = await message.guild.createChannel(
        "quoteboard",
        "text"
      );
      await qbChannel.setTopic("(AUTOMATED) - Quote Board");
      await db.run(`
        INSERT INTO main
        (guildID, channelID)
        VALUES
        ("${guildId}", "${qbChannel.id}")
      `);
      message.channel.send("Quote Board has been created.");
    }
  }
);
