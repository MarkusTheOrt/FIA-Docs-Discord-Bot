const Log = require("./Log.js");
const CommandHandler = require("./CommandHandler");

class Command {
  constructor(
    command = {
      names: [],
      groupName: "",
      description: "",
      args: "",
      cooldown: 0,
    }
  ) {
    this.names = command.names;
    this.groupName = command.groupName;
    this.description = command.description;
    this.args = command.args;
    this.cooldown = command.cooldown * 1000;
    this.lastRun = 0;
    CommandHandler.registerCommand(this);
  }

  async run(msg, command, args) {
    if (this.#ready()) {
      this.lastRun = Date.now();
      return this.run_internal(msg, command, args);
    }
  }

  async run_internal(msg, command, args) {
    Log.Warn("Empty command called.");
    return new Promise((resolve, reject) => {
      resolve();
    });
  }

  #ready() {
    return this.cooldown > 0 ? Date.now() > this.lastRun + this.cooldown : true;
  }

  names() {
    return this.super.names;
  }
}

module.exports = Command;
