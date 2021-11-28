const config = require("./config.json");
const Log = require("./utils/Log.js");
const { Client, Intents } = require("discord.js");
const DateFormatter = require("./utils/Date.js");
const Database = require("./utils/Database");

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGES],
});

client.on("ready", () => {
  Log.Info('Logged in as "' + client.user.tag + '"');
});

(async () => {
  await Database.connect();
  await client.login(config.botToken);
})().catch((err) => Log.Stack(err.stack));
