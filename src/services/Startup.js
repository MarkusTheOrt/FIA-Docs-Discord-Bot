const Client = require("../utils/Client");
const Log = require("../utils/Log");
const Database = require("../utils/Database");

// Update on joined Guilds while offline.
Client.on("ready", async () => {
  const guilds = await Client.guilds.fetch();
  await guilds.forEach(async (guild) => {
    const dbGuild = await Database.guilds.findOne({ id: guild.id });
    if (dbGuild === null) {
      const res = await Database.guilds.insertOne({
        id: guild.id,
        name: guild.name,
      });
    }
  });

  Log.Info("Startup Script Finished");
});
