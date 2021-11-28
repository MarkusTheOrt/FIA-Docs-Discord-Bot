const config = require("./config.json");
const Log = require("./utils/Log.js");
const Database = require("./utils/Database");
const RequireAll = require("require-all");
const path = require("path");
const client = require("./utils/Client");

client.commands = require("./utils/CommandHandler");

client.on("ready", async () => {
  Log.Info('Logged in as "' + client.user.tag + '"');
});

(async () => {
  await Database.connect();
  await client.login(config.botToken);
  await RequireAll(path.join(__dirname, "./commands"));
  await RequireAll(path.join(__dirname, "./services"));
})().catch((err) => Log.Stack(err.stack));
