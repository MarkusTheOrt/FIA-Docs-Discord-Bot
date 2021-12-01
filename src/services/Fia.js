const Client = require("../utils/Client");
const Moment = require("moment");
const Config = require("../config.json");
const Log = require("../utils/Log");
const { MessageEmbed } = require("discord.js");
const Database = require("../utils/Database");
const { ObjectId } = require("mongodb");

const makeEmbed = (document, event, guild) => {
  const embed = new MessageEmbed();
  embed.setTitle(document.title);
  embed.setColor(11615);
  embed.setAuthor("FIA Document");
  embed.setDescription("");
  embed.setFooter(Moment(document.date).format("lll"));
  embed.setURL(document.url);
  embed.setThumbnail(guild.thumbnail);
  if ("img" in document) {
    embed.setImage(Config.imgUrl + document.img + "?nocache");
  }

  return embed;
};

const updateDocuments = async () => {
  Client.user.setActivity({ type: "LISTENING", name: "for new Docs" });
  const documents = Database.documents.find(
    { isNew: true },
    { sort: { date: 1 } }
  );
  for (const document of await documents.toArray()) {
    const guilds = Database.guilds.find({ channel: { $gt: "" } });
    const event = await Database.events.findOne(new ObjectId(document.event));

    for (const guild of await guilds.toArray()) {
      await messageOnThread(guild, document.event, {
        embeds: [makeEmbed(document, event, guild)],
      });
    }

    Database.documents.updateOne(
      { _id: document._id },
      { $unset: { isNew: "" } }
    );
  }
  Client.user.setActivity({ type: "PLAYING", name: "Idle" });
};

const messageOnThread = async (guild, event, message) => {
  let thread = await getThread(guild, event);
  if (thread === null) {
    thread = await createThread(guild, event);
    if (thread === null) {
      Log.Error("Could not create Thread.");
      return;
    }
  }
  const channel = await Client.channels.fetch("" + thread, { cache: true });
  await channel.send(message);
};

const createThread = async (guild, event) => {
  const dbGuild = await Database.guilds.findOne({
    id: guild.id,
    channel: { $gt: "" },
  });
  if (dbGuild === null) return null;
  const dbEvent = await Database.events.findOne(new ObjectId(event));
  if (dbEvent === null) return null;
  const channel = Client.channels.cache.get(dbGuild.channel);
  const dbThread = await Database.threads.findOne({
    guild: guild.id,
    event: dbEvent._id.toString(),
  });
  if (dbThread !== null) return dbThread.id;
  const thread = await channel.threads.create({
    name: dbEvent.name,
    reason: "Created by FIA-Discord-Bot",
  });
  await Database.threads.insertOne({
    guild: dbGuild.id,
    event: dbEvent._id.toString(),
    id: thread.id,
  });
  return thread.id;
};

const getThread = async (guild, event) => {
  const dbThread = await Database.threads.findOne({
    guild: guild.id,
    event: event.toString(),
  });
  return dbThread === null ? null : dbThread.id;
};

Client.on("ready", () => {
  Log.Info("Checking documents every " + Config.fetchInterval + " Seconds.");
  updateDocuments();
  setInterval(updateDocuments, Config.fetchInterval * 1000);
});
