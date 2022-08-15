import { FindCursor, WithId } from "mongodb";

import { isNone, unwrap } from "../utils/Option.js";
import { dbGuild, WithChannel } from "../utils/Types.js";

import Client from "../utils/Client.js";
import Database from "../utils/Database.js";
import Log from "../utils/Log.js";
import Try from "../utils/Try.js";

const StartupScripts = () => {
  Client.on("ready", async () => {
    await CheckGuilds();
    await CheckChannels();
    Log.Info("Startup Script Finished");
  });
};

const CheckGuilds = async () => {
  const guilds = await Try(Client.guilds.fetch());

  for (const [id, guild] of unwrap(guilds)) {
    const dbGuild = await Try(Database.Guilds.findOne({ id: id }));
    if (isNone(dbGuild)) {
      await Try(
        Database.Guilds.insertOne({
          id: id,
          name: guild.name,
          thumbnail: "https://static.ort.dev/fiadontsueme/fia_logo.png",
        })
      );
    }
  }
};

const CheckChannels = async () => {
  const guilds = Database.Guilds.find({
    channel: { $exists: true },
  }) as FindCursor<WithId<WithChannel<dbGuild>>>;
  while (await guilds.hasNext()) {
    const guild = await Try(guilds.next());
    if (isNone(guild)) continue;
    const channel = await Try(Client.channels.fetch(unwrap(guild).channel));
    if (isNone(channel)) {
      Log.Warn(`Channel of guild "${unwrap(guild).name}" invalid.`);
      await Try(
        Database.Guilds.updateOne(
          { id: unwrap(guild).id },
          { $unset: { channel: "" } }
        )
      );
    }
  }
};

export default StartupScripts;
