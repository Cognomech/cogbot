const cmdUtils = require("../../cogLib/cmdUtils.js");


module.exports = new cmdUtils.Command({
  name: "bj",
},

{

},

async (client, message, args) => {
  try {
    const bjCmd = require(`./${args[0]}.js`);
    args.shift();
    bjCmd.run(client, message, args);
  } catch (error) {
    if (args[0] === undefined) {
      message.channel.send("No arguments found.");
    } else {
      message.channel.send(`"${args[0]}" is not a recognised sub-command of !bj.`);
    }
  }
});
