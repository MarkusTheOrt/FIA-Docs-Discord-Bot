const Client = require("../utils/Client");
const Log = require("../utils/Log");
const Database = require("../utils/Database");

Client.on("ready", async () => {
  // Update on joined Guilds while offline.
  const guilds = await Client.guilds.fetch();
  await guilds.forEach(async (guild) => {
    const dbGuild = await Database.guilds.findOne({ id: guild.id });
    if (dbGuild === null) {
      const res = await Database.guilds.insertOne({
        id: guild.id,
        name: guild.name,
        prefix: "|",
        thumbnail: "https://static.ort.dev/fiadontsueme/fia_logo.png",
      });
    }
  });
  // Cache the set channels.

  await Database.guilds
    .find({ channel: { $gt: "" } })
    .forEach(async (guild) => {
      try {
        await Client.channels.fetch(guild.channel, { cache: true });
      } catch (error) {
        Log.Error(
          "Couldn't get channel for guild '" +
            guild.id +
            "' (" +
            guild.name +
            ") -- Unsetting"
        );
        await Database.guilds.updateOne(
          { id: guild.id },
          { $unset: { channel: "" } }
        );
      }
    });

  Log.Info("Startup Script Finished");
});
