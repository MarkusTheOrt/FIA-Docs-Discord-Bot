import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { Permissions } from "discord.js";
import { ChannelType } from "discord-api-types/v10";

import { isNone, unwrap, wrap } from "../utils/Option.js";
import Config from "../config.js";
import Client from "../utils/Client.js";
import Database from "../utils/Database.js";
import Log from "../utils/Log.js";
import Try from "../utils/Try.js";

const commands = [
  new SlashCommandBuilder()
    .setName("fia")
    .setDescription("Set Options")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("channel")
        .setDescription("Set the Channel where the Bot posts new Documents.")
        .addChannelOption((option) =>
          option
            .setName("target")
            .setDescription("Only Text Channels are Valid")
        )
    ),
];

Client.on("ready", async () => {
  const rest = new REST({ version: "10" }).setToken(unwrap(Config.botToken));
  rest
    .put(Routes.applicationCommands(Config.discordAppId), {
      body: [commands[0].toJSON()],
    })
    .then(() => Log.Info("Registered Application Commands"))
    .catch(Log.Stack);
});

Client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "fia") {
    await Try(interaction.deferReply({ ephemeral: true }));

    const memberPerms = wrap(interaction.memberPermissions);
    const guildId = wrap(interaction.guildId);
    const channel = wrap(interaction.options.getChannel("target"));

    if (!unwrap(memberPerms).has(Permissions.FLAGS.ADMINISTRATOR)) {
      await Try(
        interaction.editReply(
          "You don't have the required Permissions to do that."
        )
      );
      return;
    }

    if (isNone(channel)) {
      await Try(interaction.editReply("Channel argument not set or found."));
    }

    if (unwrap(channel).type === ChannelType.GuildText) {
      await Try(interaction.editReply("Only Text channels are valid options."));
      return;
    }

    if (isNone(guildId)) {
      await Try(
        interaction.reply({
          content: "Context is missing Guild ID",
          ephemeral: true,
        })
      );
      return;
    }

    const data = await Try(
      Database.Guilds.updateOne(
        { id: unwrap(guildId) },
        { $set: { channel: unwrap(channel).id } }
      )
    );

    if (isNone(data)) {
      await Try(interaction.editReply("Database Error"));
      return;
    }

    if (unwrap(data).acknowledged === true) {
      await interaction.editReply(
        `FIA channel set to <#${unwrap(channel).id}>`
      );
    } else {
      await interaction.editReply("Database Error.");
    }
  }
});
