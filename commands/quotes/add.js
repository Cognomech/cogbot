const cmdUtils = require("../../cogLib/cmdUtils.js");
const sqlite = require("sqlite");
const discord = require("discord.js");

function defaultVals(defaultValue, ...vars) {
  for (let i = 0; i < vars.length; i = +1) {
    if (vars[i] !== undefined) return vars[i];
  }
  return defaultValue;
}

module.exports = new cmdUtils.HelperCommand(
  require("./quotes.js"),

  {
    name: "add",
  },

  {},

  async (client, message, args) => {
    if (args.length !== 2) {
      message.channel.send("Expected format: **!quotes add [author] [quote]**");
      return;
    }

    const db = await sqlite.open("./databases/quotes.db");
    const qbChannelID = (await db.get(`
      SELECT channelID channelID
      FROM main
      WHERE guildID = "${message.guild.id}"
    `)).channelID;
    const qbChannel = await message.guild.channels.get(qbChannelID);

    let authorName = args[0];
    const quote = args[1];

    let authorObj;
    if (authorName.length > 4) {
      try {
        if (authorName.startsWith("<@!")) {
          authorObj = await message.guild.members.get(authorName.slice(3, -1));
        } else {
          authorObj = await message.guild.members.get(authorName.slice(2, -1));
        }
      } catch (error) {
        authorObj = undefined;
      }
    }
    if (authorObj !== undefined) {
      authorName = `${defaultVals(authorObj.user.username, authorObj.nickname)} (${authorObj.user.username}#${authorObj.user.discriminator})`;
    }

    let image;
    try {
      image = await authorObj.user.avatarURL({ size: 128 });
    } catch (error) {
      image = "http://i63.tinypic.com/dviyqf.png";
    }


    const embed = new discord.MessageEmbed()
      .setColor(0xaf00ff)
      .setTimestamp()
      .setTitle(`"${quote}"`)
      .setDescription(`\nAdded by ${defaultVals(message.author.username, message.member.nickname)} (${message.author.username}#${message.author.discriminator})`)
      .setAuthor(`${authorName}:`, image);
    const quoteMessage = await qbChannel.send(embed);
    embed.setFooter(`ID: ${quoteMessage.id}`);
    quoteMessage.edit(undefined, embed);


    db.run(`
      INSERT INTO "${message.guild.id}"
      (messageID, author, image, body, adder, time)
      VALUES 
      ("${quoteMessage.id}", "${authorName}", "${image}", "${quote}", "${message.author.username}#${message.author.discriminator}", "${Date.now()}")
    `);
    db.close();
  }
);
