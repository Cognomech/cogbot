const discord = require("discord.js");
const sqlite = require("sqlite");
const mathsUtils = require("./mathsUtils");
const config = require("../config.json");

module.exports.update = async function update(guild, database) {
  if (!config.dev) {
    await module.exports.updateRank(guild, database);
    await module.exports.updateLB(guild, database);
  }
};

module.exports.updateRank = async function updateRank(guild, database) {
  const db = await sqlite.open(database);
  const rankPercents = [
    [20, "277876491843403797"],
    [40, "300068394772856834"],
    [60, "303135836252405771"],
    [80, "310213317811503104"],
    [100, "318732816101801984"]
  ];
  const pointPercentile = [];

  await db.run(`
    CREATE TABLE IF NOT EXISTS 
    main(
      name text PRIMARY KEY, 
      points integer CHECK (points >= 0)
    )
  `);

  const namePointData = await db.all(`
    SELECT 
    name name,
    points points
    FROM main
  `);
  const pointsArray = namePointData.map(pointObj => pointObj.points);

  rankPercents.forEach((val, i) => {
    const percent = val[0];
    if (percent === 100) {
      pointPercentile[i] = Math.max(...pointsArray);
    } else {
      pointPercentile[i] = mathsUtils.percentile(pointsArray, percent);
    }
  });

  await db.run(`
    CREATE TABLE IF NOT EXISTS
    ranks (
      name text PRIMARY KEY,
      rankID text
    )
  `);

  await Promise.all(namePointData.map(async (row) => {
    let rank;
    for (let i = 0; i < pointPercentile.length; i += 1) {
      if (!(row.points >= pointPercentile[i]) || i === pointPercentile.length - 1) {
        rank = rankPercents[i][1];
        db.run(`
          INSERT OR REPLACE INTO ranks
          (name, rankID)
          VALUES
          ("${row.name}", "${rankPercents[i][1]}")
        `);
        break;
      }
    }

    await db.run(`
      CREATE TABLE IF NOT EXISTS
      rsnames (
        id text PRIMARY KEY,
        rsname text UNIQUE
      )
    `);

    const idObj = await db.get(`
      SELECT id, id
      FROM rsnames
      WHERE rsname = "${row.name}"
    `);
    if (idObj !== undefined) {
      const id = idObj.id;
      const guildMember = guild.members.get(id);
      await Promise.all(rankPercents.map(async (val) => {
        await guildMember.removeRole(val[1]);
      }));
      await guildMember.addRole(rank);
    }
  }));
};

module.exports.updateLB = async function updateLB(guild, database) {
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
  if (!lbNames) return;

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
