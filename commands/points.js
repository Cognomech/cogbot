const sql = require("sqlite3");

module.exports.run = (client, message, args) => {
  if (!(message.member.highestRole.name === "Owner" || message.member.highestRole.name === "Deputy Owner")) { // Rank check
    message.channel.send("You do not have permission to make changes to clan points.");
    return;
  }
  if (args.length !== 3) { // Args number check
    message.channel.send(`Unexpected number of arguments found: expected 3, found ${args.length}`);
    return;
  }
  if (isNaN(args[2])) { // Points arg type check
    message.channel.send("Expected number for third argument");
    return;
  }

  const db = new sql.Database("./databases/PointsDB", (err) => { // Open database connection
    if (err) {
      console.error(err.message);
    }
  });

  db.run("CREATE TABLE IF NOT EXISTS users(name text PRIMARY KEY, points integer)"); // Creates user table if needed, which holds a list of users and their points

  db.get(`SELECT name name FROM users WHERE name = "${args[1]}"`, [], async (err, result) => { // Check user table for user
    if (err) {
      console.error(err.message);
    }

    if (!result) { // If user not found in table
      const botMessage = await message.channel.send(`${args[1]} is not currently being tracked. Would you like to initiate tracking?`); // Set up reaction menu
      await botMessage.react("✅");
      await botMessage.react("❎");

      // Will look out for reactions
      const collector = botMessage.createReactionCollector((reaction, user) => ((user === message.author) && (reaction.emoji.name === "✅" || reaction.emoji.name === "❎")), {
        max: 1,
        time: 60000,
      });
      collector.on("collect", () => {
      });
      collector.on("end", () => console.log("Ended"));
    }
  });

  db.close((err) => { // Close database connection
    if (err) {
      console.error(err.message);
    }
  });
};

module.exports.properties = {
  name: "points",
};
