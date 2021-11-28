const Client = require("./Client");
const Log = require("./Log");
const Database = require("./Database");

class CommandHandler {
  constructor() {
    this.commands = {};
    Client.on("messageCreate", async (message) => this.handleMessage(message));
  }

  registerCommand(command) {
    command.names.forEach((name) => {
      if (name in this.commands) {
        Log.Warn("Command name conflict found.");
        return;
      }
      this.commands[name.toLowerCase()] = command;
    });
  }

  async executeCommand(msg, command, args) {
    if (command in this.commands) {
      await this.commands[command].run(msg, command, args);
    }
  }

  async handleMessage(message) {
    // Find Guild-Specific prefix
    const guild = await Database.guilds.findOne({ id: message.guild.id });
    if (guild === null) return;
    const prefix = guild.prefix;
    // Skip non-prefixed messages and Bot messages.
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    this.executeCommand(message, command, args);
  }
}

module.exports = new CommandHandler();
