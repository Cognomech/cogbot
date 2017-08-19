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
    message.channel.send("Expected number for third argument.");
    return;
  }
  if (args[2] < 0) { // Negative number check
    message.channel.send("Use \"!points remove\" to remove points.");
    return;
  }
  if (args[2] === "0") { // Zero check
    message.channel.send("You cannot add 0 points.");
    return;
  }

  if (args[0] === "add") {
    const db = new sql.Database("./databases/PointsDB", (err) => { // Open database connection
      if (err) {
        console.log(err.message);
        return;
      }

      db.run("CREATE TABLE IF NOT EXISTS users(name text PRIMARY KEY, points integer CHECK (points >= 0))", [], (err2) => { // Creates user table if needed, which holds a list of users and their points
        if (err2) {
          console.log(err2);
          return;
        }

        db.get(`SELECT name name FROM users WHERE name = "${args[1]}"`, [], async (err3, result) => { // Check user table for user
          if (err3) {
            console.log(err3.message);
            return;
          }

          if (!result) { // If user not found in table
            const botMessage = await message.channel.send(`${args[1]} is not currently being tracked. Would you like to initiate tracking?`); // Set up reaction menu
            await botMessage.react("✅");
            await botMessage.react("❎");

            // Will look out for reactions
            const collector = botMessage.createReactionCollector((reaction, user) => ((user === message.author) && (reaction.emoji.name === "✅" || reaction.emoji.name === "❎")), {
              max: 1,
              time: 30000,
            });

            collector.on("end", (collected, reason) => { // Reaction detection finished
              const reaction = collected.first();
              if (reason === "time" || reaction.emoji.name === "❎") { // User took too long to respond or said no tracking - we're done here!
                botMessage.clearReactions();
              } else { // User wants to begin tracking
                db.run(`INSERT INTO users (name, points) VALUES ("${args[1]}", ${args[2]})`, [], (err4) => { // Add user and points
                  if (err4) {
                    console.log(err2.message);
                  }

                  message.channel.send(`${args[1]} is now being tracked and has been awarded ${args[2]} points.`);
                  db.close((err5) => { // Close database connection
                    if (err5) {
                      console.log(err5.message);
                    }
                  });
                });
              }
            });
          } else { // User has been found in table
            db.get(`SELECT points points FROM users WHERE name = "${args[1]}"`, [], (err4, row) => {
              if (err4) {
                console.log(err4.message);
              }

              const newpoints = +row.points + +args[2];
              db.run(`UPDATE users SET points = ${newpoints} WHERE name = "${args[1]}"`, [], (err5) => {
                if (err5) {
                  console.log(err5.message);
                }

                message.channel.send(`${args[1]} now has ${newpoints} points.`);
              });
            });
          }
        });
      });
    });
  }
};

module.exports.properties = {
  name: "points",
};
