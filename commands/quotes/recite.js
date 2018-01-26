const cmdUtils = require("../../cogLib/cmdUtils.js");
const sqlite = require("sqlite");
const discord = require("discord.js");

module.exports = new cmdUtils.HelperCommand(
  require("./quotes.js"),

  {
    name: "add",
  },

  {},

  async (client, message) => {
    const db = await sqlite.open("./databases/quotes.db");
    const quoteObj = await db.get(`
      SELECT *
      FROM "${message.guild.id}"
      ORDER BY RANDOM()
      LIMIT 1
    `);
    const time = new Date(Number.parseInt(quoteObj.time, 10));

    const embed = new discord.MessageEmbed()
      .setColor(0xaf00ff)
      .setTimestamp(time)
      .setTitle(`"${quoteObj.body}"`)
      .setDescription(`\nAdded by ${quoteObj.adder}`)
      .setAuthor(`${quoteObj.author}:`, quoteObj.image)
      .setFooter(`ID: ${quoteObj.messageID}`);
    await message.channel.send(embed);
  }
);
