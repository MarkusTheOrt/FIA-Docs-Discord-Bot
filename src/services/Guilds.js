const Client = require("../utils/Client");
const Database = require("../utils/Database");

Client.on("guildUpdate", async (oldGuild, newGuild) => {
  await Database.guilds.updateOne(
    { id: oldGuild.id },
    { $set: { id: newGuild.id, name: newGuild.name } }
  );
});

Client.on("guildCreate", async (guild) => {
  await Database.guilds.insertOne({
    id: guild.id,
    name: guild.name,
    prefix: "|",
    thumbnail: "https://static.ort.dev/fiadontsueme/fia_logo.png",
  });
});

Client.on("guildDelete", async (guild) => {
  await Database.guilds.deleteOne({ id: guild.id });
});
