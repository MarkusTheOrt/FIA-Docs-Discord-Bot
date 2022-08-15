import Client from "../utils/Client.js";
import Database from "../utils/Database.js";

const GuildScripts = () => {
  Client.on("guildUpdate", async (oldGuild, newGuild) => {
    await Database.Guilds.updateOne(
      { id: oldGuild.id },
      { $set: { id: newGuild.id, name: newGuild.name } }
    );
  });

  Client.on("guildCreate", async (guild) => {
    await Database.Guilds.insertOne({
      id: guild.id,
      name: guild.name,
      thumbnail: "https://static.ort.dev/fiadontsueme/fia_logo.png",
    });
  });

  Client.on("guildDelete", async (guild) => {
    await Database.Guilds.deleteOne({ id: guild.id });
  });
};

export default GuildScripts;
