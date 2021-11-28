const { MessageEmbed } = require("discord.js");
const Command = require("../utils/Command");
const Perms = require("discord.js").Permissions;
const Client = require("../utils/Client");
const Database = require("../utils/Database");

class SetChannel extends Command {
  constructor() {
    super({
      names: ["setChannel"],
      groupName: "Settings",
      description: "Sets the FIA Docs channel for this Server.",
      args: ["Channel"],
      cooldown: 0,
    });
  }

  async run_internal(msg, command, args) {
    if (msg.member.permissions.has(Perms.FLAGS.ADMINISTRATOR) === false) return;
    if (args.length < 1) {
      const embed = new MessageEmbed();
      embed.title = "❌ Wrong Usage";
      embed.setDescription("Missing or wrong channel parameter.");
      msg.channel.send({ embeds: [embed] });
      return;
    }
    const channelRegex = /<#(\d+)>/;
    const channelId = channelRegex.exec(args[0]);
    if (channelId === null) {
      const embed = new MessageEmbed();
      embed.title = "❌ Channel not found";
      embed.setDescription("Couldn't find your specified channel.");
      msg.channel.send({ embeds: [embed] });
      return;
    }
    const channel = await Client.channels.fetch(channelId[1], { cache: true });
    if (channel === null || channel === undefined) {
      console.log(channel);
      const embed = new MessageEmbed();
      embed.title = "❌ Channel not found";
      embed.setDescription("Couldn't find your specified channel.");
      msg.channel.send({ embeds: [embed] });
      return;
    }
    Database.guilds.updateOne(
      { id: msg.guild.id },
      { $set: { channel: channel.id } }
    );
    const embed = new MessageEmbed();
    embed.title = "✅ Channel Set";
    embed.setDescription("Channel Set to " + `<#${channel.id}>`);
    msg.channel.send({ embeds: [embed] });
  }
}

module.exports = new SetChannel();
