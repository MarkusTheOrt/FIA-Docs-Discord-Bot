const { MessageEmbed } = require("discord.js");
const Command = require("../utils/Command");
const Perms = require("discord.js").Permissions;
const Client = require("../utils/Client");
const Database = require("../utils/Database");

class SetThumbnail extends Command {
  constructor() {
    super({
      names: ["setThumbnail"],
      groupName: "Settings",
      description: "Sets the Embed Thumbnail on this server.",
      args: ["Thumbnail Url"],
      cooldown: 0,
    });
  }

  async run_internal(msg, command, args) {
    if (msg.member.permissions.has(Perms.FLAGS.ADMINISTRATOR) === false) return;
    if (args.length < 1) {
      const embed = new MessageEmbed();
      embed.title = "❌ Wrong Usage";
      embed.setDescription("Missing or wrong url parameter.");
      msg.channel.send({ embeds: [embed] });
      return;
    }
    Database.guilds.updateOne(
      { id: msg.guild.id },
      { $set: { thumbnail: args[0] } }
    );
    const embed = new MessageEmbed();
    embed.title = "✅ Thumnbail Set";
    embed.setThumbnail(args[0]);
    msg.channel.send({ embeds: [embed] });
  }
}

module.exports = new SetThumbnail();
