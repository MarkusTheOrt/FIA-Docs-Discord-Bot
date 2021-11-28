const Client = require("../utils/Client");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
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
  embed.setAuthor("FIA Document - " + event.name);
  embed.setFooter(Moment(document.date).format("lll"));
  embed.setURL(document.url);
  embed.setThumbnail(guild.thumbnail);
};

const updateDocuments = async () => {
  const documents = Database.documents.find({ isNew: true });
  documents.forEach(async (document) => {
    const guilds = Database.guilds.find({ channel: { $gt: "" } });
    const event = await Database.events.findOne(new ObjectId(document.event));
    await guilds.forEach(async (guild) => {
      messageOnThread(guild, event._id, {
        embeds: [makeEmbed(document, event, guild)],
      });
    });
    Database.documents.updateOne(document._id, {
      $unset: "isNew",
    });
  });
};

const messageOnThread = async (guild, event, message) => {
  const thread = await getThread(guild, event);
  //const dsthread = await Client.channels.fetch("914455624828477441");
  //await dsthread.send(message);
};

const createThread = async (guild, event) => {
  const dbGuild = await Database.guilds.findOne({ id: guild });
  if (!("channel" in dbGuild)) return;
  const dbEvent = await Database.events.findOne(new ObjectId(event));
  const channel = Client.channels.cache.get(dbGuild.channel);
  const thread = await channel.threads.create({
    name: dbEvent.name,
    reason: "Created by FIA-Discord-Bot",
  });
  await Database.threads.insertOne({
    guild: dbGuild.id,
    event: dbEvent._id.toString(),
    id: thread.id,
  });
};

const getThread = async (guild, event) => {
  const dbThread = await Database.threads.findOne({
    guild: guild.id,
    event: event.toString(),
  });
  return dbThread.id;
};

Client.on("ready", () => {
  updateDocuments();
  //setInterval(updateDocuments, Config.fetchInterval * 1000);
});

/** 
 const fetchDocuments = async () => {
  // Fetching Documents from the FIA Website
  fetch("https://www.fia.com/documents").then(async (request) => {
    if (request.ok === false) {
      Log.Warn(`FIA.com encountered ${request.status}`);
      return;
    }
    const html = await request.text();
    // Parse Website Body

    await (async () => {
      const parsedHtml = cheerio.load(html);
      const event = parsedHtml(".event-title.active");
      const eventTitle = event.text().trim();
      const dbEvent = await Database.events.updateOne(
        { name: eventTitle },
        {
          $set: {
            name: eventTitle,
            year: new Date().getUTCFullYear(),
            threads: [],
          },
        },
        { upsert: true }
      );
      const guilds = await Database.guilds.find();
      const channel = await Client.channels.fetch("914319201571864647");
      const embed = new MessageEmbed();
      embed.setTitle("Qatar Grand Prix");
      embed.setDescription(">> FIA Documents");
      const thread = await channel.threads.create({
        name: eventTitle,
        reason: "FIA-Docs-Bot",
      });
      // Retrieve all link elements whose url ends with pdf.
      const documents = parsedHtml(".event-title.active + ul a[href$=pdf]");
      const newDocs = [];
      documents.toArray().forEach((document) => {
        const newDoc = {
          event: eventTitle,
          url: encodeURI(`https://www.fia.com${document.attribs.href}`),
        };
        const title = parsedHtml(`a[href="${document.attribs.href}"] .title`);
        const stringDate = parsedHtml(`a[href="${document.attribs.href}"]`);
        newDoc.title = title.text().trim();
        newDoc.date = Moment(
          stringDate.text().trim(),
          "D.M.YY HH:mm",
          "Europe/Berlin"
        ).format();
        if (
          newDoc.title !== undefined &&
          newDoc.date !== undefined &&
          newDoc.url !== undefined &&
          newDoc.event !== undefined
        ) {
          thread.send({ embeds: [makeEmbed(newDoc)] });
        }
      });
      //console.log(newDocs);
    })().catch((e) => Log.Stack(e.stack));
  });
};

const makeEmbed = (document) => {
  const embed = new MessageEmbed();
  embed.color = 11615;
  embed.setAuthor("FIA Document");
  embed.setTitle(document.title);
  embed.setURL(document.url);
  embed.setThumbnail("https://static.ort.dev/fiadontsueme/fia_logo.png");
  embed.setFooter(Moment(document.date).format("lll"));
  return embed;
};
 */
