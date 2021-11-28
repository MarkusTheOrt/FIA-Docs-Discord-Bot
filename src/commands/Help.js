const { MessageEmbed } = require("discord.js");
const Command = require("../utils/Command");
const CommandHandler = require("../utils/CommandHandler");
const Perms = require("discord.js").Permissions;

class Help extends Command {
  constructor() {
    super({
      names: ["help"],
      groupName: "Utilities",
      description: "Show a list of possible Commands.",
      args: [],
      cooldown: 10,
    });
  }

  async run_internal(msg, command, args) {
    if (msg.member.permissions.has(Perms.FLAGS.ADMINISTRATOR) === false) return;
    const embed = new MessageEmbed();
    embed.title = "Help";
    for (const key in CommandHandler.commands) {
      const cmd = CommandReader.commands[key];
      embed.addField(cmd.names[0], cmd.description, false);
    }
    msg.channel.send({ embeds: [embed] });
  }
}

module.exports = new Help();
