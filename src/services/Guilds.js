const Client = require("../utils/Client");
const Log = require("../utils/Log");
const Database = require("../utils/Database");

Client.on("guildUpdate", async (oldGuild, newGuild) => {
  await Database.guilds.updateOne(
    { id: oldGuild.id },
    { $set: { id: newGuild.id, name: newGuild.name } }
  );
});

Client.on("guildCreate", async (guild) => {
  await Database.guilds.insertOne({ id: guild.id, name: guild.name });
});

Client.on("guildDelete", async (guild) => {
  await Database.guilds.deleteOne({ id: guild.id });
});
