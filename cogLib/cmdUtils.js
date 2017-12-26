const fileUtils = require("./fileUtils.js");

function defaultVals(defaultValue, ...vars) {
  for (let i = 0; i < vars.length; i = +1) {
    if (vars[i] !== undefined) return vars[i];
  }
  return defaultValue;
}


module.exports.Command = class Command {
  constructor(properties = {}, permissions = {}, runFunc = null) {
    this.properties = {
      name: defaultVals(null, properties.name),
    };
    this.permissions = {
      DMs: defaultVals(true, permissions.DMs),
      guildIDs: defaultVals(null, permissions.guildIDs),
      roleIDs: defaultVals(null, permissions.roleIDs),
      userIDs: defaultVals(null, permissions.userIDs),
    };
    this.runFunc = runFunc;
  }

  checkUserPermission(message) {
    if ((this.permissions.userIDs !== null)
    && !(this.permissions.userIDs.includes(message.author.id))) {
      return false;
    }
    return true;
  }
  checkRolePermission(message) {
    if (this.permissions.roleIDs !== null) {
      return message.member.roles.some((role, id) => this.permissions.roleIDs.includes(id));
    }
    return true;
  }
  checkGuildPermission(message) {
    if (((this.permissions.guildIDs !== null)
    && !(this.permissions.guildIDs.includes(message.guild.id)))) {
      return false;
    }
    return true;
  }
  checkDMPermission(message) {
    if (message.channel.type === "dm" || message.channel.type === "group") {
      return this.permissions.DMs;
    }
    return true;
  }
  checkPermissionToRun(message) {
    if (!this.checkDMPermission(message)) {
      message.channel.send("You cannot run this command though a direct message.");
      return false;
    }
    if (!this.checkGuildPermission(message)) {
      message.channel.send("You cannot run this command in this guild.");
      return false;
    }
    if (!this.checkRolePermission(message) || !this.checkUserPermission(message)) {
      message.channel.send("You cannot run this command.");
      return false;
    }
    return true;
  }

  run(client, message, args) {
    const canRun = this.checkPermissionToRun(message);
    if (canRun) {
      this.runFunc(client, message, args);
    }
  }
};


module.exports.HelperCommand = class HelperCommand extends module.exports.Command {
  constructor(parent, properties = parent.properties, permissions = parent.permissions, run = null) {
    const props = {
      name: defaultVals(parent.properties.name, properties.name),
    };
    const perms = {
      DMs: defaultVals(parent.permissions.DMs, permissions.DMs),
      guildIDs: defaultVals(parent.permissions.guildIDs, permissions.guildIDs),
      roleIDs: defaultVals(parent.permissions.roleIDs, permissions.roleIDs),
      userIDs: defaultVals(parent.permissions.userIDs, permissions.userIDs),
    };
    super(props, perms, run);
    this.parent = parent;
  }
};


module.exports.CommandHandler = class CommandHandler {
  constructor(absCmdDir) {
    this.absCmdDir = absCmdDir;
    this.cmdRegistry = new Map();
  }

  registerNewCommand(filePath) {
    try {
      const cmd = require(filePath);
      if (cmd instanceof module.exports.HelperCommand) {
        console.log(`Skipped over HelperCommand "${cmd.properties.name}", child of Command "${cmd.parent.properties.name}"`);
        return;
      }
      if (!(cmd instanceof module.exports.Command)) {
        console.log(`Attempted to register ${filePath} as a command, but it is not exporting a Command.`);
        return;
      }
      if (this.cmdRegistry.has(cmd.properties.name)) {
        console.log(`"${cmd.properties.name}" is already registered as a command. Duplicate found in ${filePath}`);
        return;
      }

      this.cmdRegistry.set(cmd.properties.name, cmd);
      console.log(`"${cmd.properties.name}" has been registered into the command registry.`);
    } catch (error) {
      console.log(`\nError loading ${filePath}: ${error.message}\n`);
    }
  }

  async registerCmdsFromDir(dir = this.absCmdDir) {
    const files = await fileUtils.asyncRecursiveReaddir(dir);
    console.log(`Attempting to load ${files.length} command files:`);
    files.forEach(file => this.registerNewCommand(file));
  }
};
