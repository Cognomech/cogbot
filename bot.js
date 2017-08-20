const config = require("./config.json");
const discord = require("discord.js");
const fs = require("fs");

const client = new discord.Client();
client.commands = new discord.Collection();

//  Read files, check for .js type and add to commands collection
fs.readdir("./commands/", (err, files) => {
  if (err) console.error(err);

  const jsFiles = files.filter(file => file.split(".").pop() === "js"); // jsFiles is array of all .js files in ./commands/
  if (jsFiles.length <= 0) { // No .js files found
    console.log("No commands available to load.");
    return;
  }
  if (jsFiles.length === 1) { // 1 .js file found
    console.log("Loading 1 command.");
  } else { // More than 1 .js file found
    console.log(`Loading ${jsFiles.length} commands.`);
  }
  console.log("");

  jsFiles.forEach((file, i) => { // Adds each command to the collection for later recall
    const fileMod = require(`./commands/${file}`); // Gets the file module
    client.commands.set(fileMod.properties.name, fileMod); // Pairs command name with the module
    console.log(`${i + 1}: ${file} loaded.`);
  });
  console.log("");
});

// Triggers upon successful client login
client.on("ready", async () => {
  console.log(`${client.user.username} is ready.`);
  console.log("");

  try { // Generates a link that can be used to invite the bot to a server
    const link = await client.generateInvite(["ADMINISTRATOR"]);
    console.log(`${client.user.username} can be invited to a server with the following link: ${link}`);
    console.log("");
  } catch (e) {
    console.log(e.stack);
  }
});

// Triggers upon detecting any message
client.on("message", async (message) => {
  if (message.author.bot) return; // Ignores messages by other bots, prevents loops
  if (!message.content.startsWith(config.prefix)) return; // Ignores messages without proper prefix

  const messageArray = message.content.match(/[^\s"']+|"([^"]*)"/gm); // Splits message by whitespace, args in quotes fully preserved
  const command = messageArray[0]; // Actual command is first string
  const args = messageArray.slice(1); // Command arguments are any following strings
  args.forEach((arg, index) => { // Remove quote marks as needed
    if (arg.charAt(0) === "\"") {
      args[index] = arg.slice(1, -1);
    }
  });
  const commandFile = client.commands.get(command.slice(config.prefix.length)); // Grabs command module from collection
  if (commandFile) commandFile.run(client, message, args); // If command module exists, run it
});

client.login(config.token);
