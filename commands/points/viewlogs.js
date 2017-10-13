const cmdUtils = require("../../cogLib/cmdUtils.js");
const sqlite = require("sqlite");
const discord = require("discord.js");
const clientUtils = require("../../cogLib/clientUtils.js");

module.exports = new cmdUtils.HelperCommand(
  require("./points.js"),

  {
    name: "viewlogs",
  },

  {},

  (async (client, message, args) => {
    const db = await sqlite.open("databases/points.db");
    const username = args[0];
    let totalRows;
    let totalPoints;
    try {
      totalRows = (await db.get(`SELECT count(*) FROM "${username}"`))["count(*)"];
      totalPoints = (await db.get(`SELECT points, points FROM main WHERE name = "${username}"`)).points;
    } catch (error) {
      message.channel.send(`Could not find point change logs for ${username}`);
    }
    const rowsPerPage = 10;
    let pageNumber = 0;

    async function grabLogs() {
      const logArray = await db.all(`
        SELECT readableTime readableTime, pointsChange pointsChange, log log, author author 
        FROM "${username}"
        ORDER BY epochTime DESC
        LIMIT ${rowsPerPage}
        OFFSET ${10 * pageNumber}`
      );

      let logString = "";
      for (let i = 0; i < logArray.length; i += 1) {
        const row = logArray[i];
        logString += `[${row.author} at ${row.readableTime}]: ${row.pointsChange} for ${row.log}\n\n`;
      }
      logString = `\`\`\`${logString}\`\`\``;
      return logString;
    }
    async function generateEmbed() {
      return new discord.RichEmbed()
        .setColor(0xaf00ff)
        .setThumbnail(`http://services.runescape.com/m=avatar-rs/a=13/${username}/chat.png`)
        .setTimestamp()
        .setTitle(`__${username}'s Clan Points Logs__ - Total: ${totalPoints} Points`)
        .setDescription(`${await grabLogs()}`)
        .setFooter(`
          Showing ${(10 * pageNumber) + 1}-
          ${(pageNumber + 1) * 10 < totalRows ? (10 * pageNumber) + 10 : totalRows} of ${totalRows} rows
        `);
    }
    const embed = await generateEmbed();

    const clientMessage = await message.channel.send({ embed });
    async function updateMessage(pageNum) {
      pageNumber = pageNum;
      const newEmbed = await generateEmbed();
      await clientMessage.edit(undefined, newEmbed);
    }

    await clientUtils.reactLeftRightEndMenu(client,
      message,
      clientMessage,
      () => {
        if (pageNumber > 0) {
          updateMessage(pageNumber - 1);
        }
      },
      () => {
        if ((pageNumber + 1) * 10 < totalRows) {
          updateMessage(pageNumber + 1);
        }
      }
    );

    db.close();
  })
);
