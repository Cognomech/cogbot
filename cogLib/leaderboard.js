const discord = require("discord.js");
const sqlite = require("sqlite");

module.exports.update = async function update(guild, database) {
  const db = await sqlite.open(database);
  let position = 1;
  let lbChannel;
  let lbNames = "";
  let lbPoints = "";
  let posText = "";

  await db.each(`
    SELECT name name, points points 
    FROM "main"
    ORDER BY points DESC`,

    (err, row) => {
      if (err) {
        console.log(err);
        return;
      }

      lbNames += `${row.name}\n`;
      lbPoints += `${row.points}\n`;
      posText += `${position})\n`;
      position += 1;
    }
  );
  await db.close();

  const lbEmbed = new discord.MessageEmbed()
    .setColor(0xaf00ff)
    .setTimestamp()
    .setTitle("__Points Leaderboard__")
    .addField("Position", posText, true)
    .addField("Name", lbNames, true)
    .addField("Points", lbPoints, true);

  if (guild.channels.exists("name", "leaderboard")) {
    lbChannel = guild.channels.find("name", "leaderboard");
  } else {
    lbChannel = await guild.createChannel(
      "leaderboard",
      "text"
    );
    await lbChannel.setParent("360791910329090048");
    await lbChannel.setTopic("(AUTOMATED) - Clan Leaderboard");
  }

  await lbChannel.bulkDelete(10);
  await lbChannel.send(lbEmbed);
};
