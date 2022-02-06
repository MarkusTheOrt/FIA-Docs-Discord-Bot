const Config = require("./config.js");
const Log = require("./utils/Log.js");
const Database = require("./utils/Database");
const RequireAll = require("require-all");
const Path = require("path");
const Client = require("./utils/Client");

Client.on("ready", async () => {
  Log.Info('Logged in as "' + Client.user.tag + '"');
});

(async () => {
  await Database.connect();
  RequireAll(Path.join(__dirname, "./services"));
  await Client.login(Config.botToken);
})().catch((err) => Log.Stack(err.stack));
