import { isNone, unwrap } from "./utils/Option.js";
import Config from "./config.js";
import GuildScripts from "./services/Guilds.js";
import StartupScripts from "./services/Startup.js";
import Client from "./utils/Client.js";
import Database from "./utils/Database.js";
import Log from "./utils/Log.js";
import runner from "./services/Fia.js";

(async () => {
  Client.on("ready", async () => {
    Log.Info('Logged in as "' + Client.user?.tag + '"');
    StartupScripts();
    Client.user?.setActivity({ type: "WATCHING", name: "fia.com/documents" });
    Log.Info("Starting Runner.");
    for (;;) {
      await runner();
      await new Promise<void>((resolve) =>
        setTimeout(resolve, Config.fetchInterval * 1000)
      );
    }
  });

  if (isNone(Config.botToken)) {
    await Log.Error("Bot token not set, can't continue.");
    return;
  }
  if (isNone(Config.mongoConnection)) {
    await Log.Error("MongoDB Connection string not set, can't continue.");
    return;
  }

  GuildScripts();
  await Database.connect();
  await Client.login(unwrap(Config.botToken));
})().catch((err) => Log.Stack(err.stack));
