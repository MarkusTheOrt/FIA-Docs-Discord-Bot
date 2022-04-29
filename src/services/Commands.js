const { SlashCommandBuilder } = require("@discordjs/builders");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const config = require("../config");
const DB = require("../utils/Database.js");
const Logger = require("../utils/Log.js");
const Client = require("../utils/Client.js");
const { Permissions } = require("discord.js");

const commands = [
  new SlashCommandBuilder()
    .setName("fia")
    .setDescription("Set Options")
    .addSubcommand(subcommand => subcommand
      .setName("channel")
      .setDescription("Set the Channel where the Bot posts new Documents.")
      .addChannelOption(option => option
        .setName("target").setDescription("Only Text Channels are Valid"))
    )
]

Client.on("ready", async() => {
  const rest = new REST({ version: '9' }).setToken(config.botToken);
    while(await guilds.hasNext()) {
    rest.put(Routes.applicationCommands(config.discordAppId), { body: [commands[0].toJSON()] })
      .then(() => Logger.Info("Registered Application Commands"))
      .catch(Logger.Stack)
  }
});

Client.on("interactionCreate", async interaction => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "fia") {
    if (interaction.memberPermissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
      const channel = interaction.options.getChannel('target');
      if (!channel.isText()) {
        await interaction.reply({ content: "Only Text channels are valid options.", ephemeral: true });
        return;
      }
      const data = await DB.guilds.updateOne({ id: interaction.guildId }, { $set: { channel: channel.id } });
      if (data.acknowledged === true) {
        await interaction.reply({ content: `FIA channel set to <#${channel.id}>`, ephemeral: true });
      } else {
        await interaction.reply({ content: "Database Error.", ephemeral: true });
      }
    } else {
      await interaction.reply({ content: "You must be an Administrator on this guild.", ephemeral: true });
    }
  }

});







