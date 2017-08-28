const sql = require("sqlite3");

module.exports.run = (client, message, args) => {
  if (!(message.member.highestRole.name === "Owner" || message.member.highestRole.name === "Deputy Owner")) { // Rank check
    message.channel.send("You do not have permission to make changes to clan points.");
    return;
  }

  if (args[0] === "change") {
    if (args.length !== 4) { // Args number check
      message.channel.send(`Unexpected number of arguments found: expected 4, found ${args.length}`);
      return;
    }
    if (isNaN(args[2])) { // Points arg type check
      message.channel.send("Expected number for third argument.");
      return;
    }
    if (args[2] === "0") { // Zero check
      message.channel.send("You cannot make a change of 0 points.");
      return;
    }

    const db = new sql.Database("./databases/Points.db", (err) => { // Open database connection
      if (err) {
        console.log(err);
        return;
      }

      db.run("CREATE TABLE IF NOT EXISTS users(name text PRIMARY KEY, points integer CHECK (points >= 0))", [], (err2) => { // Creates user table if needed, which holds a list of users and their points
        if (err2) {
          console.log(err2);
          return;
        }

        db.get(`SELECT name name FROM users WHERE name = "${args[1]}"`, [], async (err3, result) => { // Check user table for user
          if (err3) {
            console.log(err3);
            return;
          }

          if (!result) { // If user not found in table
            if (args[2] < 0) { // Negative number check
              message.channel.send(`You cannot subtract points from ${args[1]} because they are not currently being tracked.`);
              return;
            }

            const botMessage = await message.channel.send(`${args[1]} is not currently being tracked. Would you like to initiate tracking?`); // Set up reaction menu
            await botMessage.react("✅");
            await botMessage.react("❎");

            // Will look out for reactions
            const collector = botMessage.createReactionCollector((reaction, user) => ((user === message.author) && (reaction.emoji.name === "✅" || reaction.emoji.name === "❎")), {
              max: 1,
              time: 30000,
            });

            collector.on("end", (collected, reason) => { // Reaction detection finished
              botMessage.clearReactions();
              const reaction = collected.first();
              if (reason === "time" || reaction.emoji.name === "❎") { // User took too long to respond or said no tracking - we're done here!
              } else { // User wants to begin tracking
                db.run(`INSERT INTO users (name, points) VALUES ("${args[1]}", ${args[2]})`, [], (err4) => { // Add user and points
                  if (err4) {
                    console.log(err2);
                    return;
                  }

                  db.run(`CREATE TABLE IF NOT EXISTS ${args[1]} (time text PRIMARY KEY, pointschange integer, log text)`, [], (err6) => { // Creates new table for user logs if not already there (it shouldn't be)
                    if (err) {
                      console.log(err6);
                      return;
                    }

                    const dateObj = new Date();
                    const date = dateObj.toUTCString();

                    db.run(`INSERT INTO ${args[1]} (time, pointschange, log) VALUES ("${date}", ${args[2]}, "${args[3]}")`, [], (err1) => { // Write new log into table "username"
                      if (err1) {
                        console.log(err1);
                      }
                      message.channel.send(`${args[1]} is now being tracked and has been awarded ${args[2]} points for: ${args[3]}`);

                      db.close((err5) => { // Close database connection
                        if (err5) {
                          console.log(err5);
                        }
                      });
                    });
                  });
                });
              }
            });
          } else { // User has been found in table
            db.get(`SELECT points points FROM users WHERE name = "${args[1]}"`, [], (err4, row) => { // Grab points value from table "users"
              if (err4) {
                console.log(err4);
              }

              const newpoints = +row.points + +args[2];
              if (newpoints < 0) { // Negative number check
                message.channel.send("This change would result in a negative point value, which is not allowed.");
                return;
              }
              db.run(`UPDATE users SET points = ${newpoints} WHERE name = "${args[1]}"`, [], (err5) => { // Update points for user in table "users"
                if (err5) {
                  console.log(err5);
                }

                const dateObj = new Date();
                const date = dateObj.toUTCString();

                db.run(`INSERT INTO ${args[1]} (time, pointschange, log) VALUES ("${date}", ${args[2]}, "${args[3]}")`, [], (err1) => { // Write new log into table "username"
                  if (err1) {
                    console.log(err1);
                  }

                  message.channel.send(`${args[1]} now has ${newpoints} points after being awarded ${args[2]} for: ${args[3]}`);

                  db.close((err6) => { // Close the database
                    if (err6) {
                      console.log(err6);
                    }
                  });
                });
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
