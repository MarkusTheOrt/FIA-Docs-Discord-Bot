const fs = require("fs");
const dateFormatter = require("./Date.js");

class Log {
  constructor() {}

  #log(level, message) {
    console.log(`[${dateFormatter.isoTime()}] ${level}: ${message}`);
  }

  Warn(message) {
    this.#log(" WARN", message);
  }

  Info(message) {
    this.#log(" INFO", message);
  }

  Error(message) {
    this.#log("ERROR", message);
  }

  Stack(stack) {
    this.#log("FATAL", stack);
  }
}

module.exports = new Log();
