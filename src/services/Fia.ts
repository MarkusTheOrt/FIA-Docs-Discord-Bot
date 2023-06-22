import { MessageEmbed, TextChannel, ThreadChannel } from "discord.js";

import { isNone, none, Option, unwrap } from "../utils/Option.js";
import { dbDocument, dbEvent, dbGuild, WithChannel } from "../utils/Types.js";

import Client from "../utils/Client.js";
import Database from "../utils/Database.js";
import Try, { TryHarder } from "../utils/Try.js";
import { FindCursor, ObjectId, WithId } from "mongodb";
import Log from "../utils/Log.js";

const runner = async () => {
    const documents = Database.Documents.find({ notified: { $exists: false } });

    while (await documents.hasNext()) {
        const guilds = Database.Guilds.find({
            channel: { $exists: true },
        }) as FindCursor<WithId<WithChannel<dbGuild>>>;
        const [document, fetch_err] = await TryHarder(documents.next());
        if (fetch_err !== null || document === null) {
            if (fetch_err !== null) {
                console.log("Error Fetching Documents:\n", fetch_err);
            }
            continue;
        }
        const [event, event_fetch_err] = await TryHarder(
            Database.Events.findOne({ _id: new ObjectId(document.event) })
        );
        if (event_fetch_err !== null || event === null) {
            if (event_fetch_err !== null) {
                console.error("Error fetching Events:\n", event_fetch_err);
            }
            continue;
        }

        // mark document as posted before we post... learned that the hard way KEKW
        const [_, err] = await TryHarder(
            Database.Documents.updateOne(
                { _id: document._id },
                { $set: { notified: true } }
            )
        );

        if (err !== null) {
            console.error("Error updating document.", err);
            continue;
        }
        // Post document
        while (await guilds.hasNext()) {
            const [guild, err] = await TryHarder(guilds.next());
            if (err !== null || guild === null) {
                continue;
            }
            const thread = await findDBThread(guild, event);
            if (isNone(thread)) continue;
            const [_, send_err] = await TryHarder(
                unwrap(thread).send({
                    // If the guild has set up role mentions, mention the role
                    ...(guild.role
                        ? { content: `<@&${guild.role}>` }
                        : {}),
                    embeds: [makeEmbed(document, guild)],
                })
            );
            if (send_err !== null) {
                console.error("Error sending documents:\n", send_err);
            }
        }
    }
    return;
};

const findThread = async (
    guild: WithChannel<dbGuild>,
    id: string
): Promise<Option<ThreadChannel>> => {
    const channel = await findChannel(guild.channel);
    if (isNone(channel)) return none;
    const thread = await Try(unwrap(channel).threads.fetch(id));
    if (isNone(thread)) {
        Log.Error("Couldn't fetch thread.");
        return none;
    }
    if (unwrap(thread).isText() && unwrap(thread).isThread()) {
        return thread as Option<ThreadChannel>;
    }
    return none;
};

const createThread = async (
    guild: WithChannel<dbGuild>,
    event: WithId<dbEvent>
): Promise<Option<ThreadChannel>> => {
    const channel = await findChannel(guild.channel);
    if (isNone(channel)) return none;
    const thread = await Try(
        unwrap(channel).threads.create({ name: `${event.year} ${event.name}` })
    );
    if (isNone(thread)) return none;
    Database.Threads.insertOne({
        guild: guild.id,
        event: event._id.toString(),
        id: unwrap(thread).id,
    });
    return thread;
};

const findDBThread = async (
    guild: WithChannel<dbGuild>,
    event: WithId<dbEvent>
) => {
    const thread = await Try(
        Database.Threads.findOne({
            guild: guild.id,
            event: event._id?.toString(),
        })
    );
    if (isNone(thread)) return createThread(guild, event);
    return findThread(guild, unwrap(thread).id);
};

const findChannel = async (id: string): Promise<Option<TextChannel>> => {
    const channel = await Try(Client.channels.fetch(id));
    if (isNone(channel)) return none;
    if (unwrap(channel).isText()) {
        return channel as Option<TextChannel>;
    }
    return none;
};

const makeEmbed = (document: dbDocument, guild: dbGuild) => {
    const embed = new MessageEmbed()
        .setTitle(document.title)
        .setColor(11615)
        .setAuthor({ name: "FIA Document" })
        .setDescription("")
        .setURL(document.url)
        .setThumbnail(guild.thumbnail)
        .setTimestamp(document.date)
        .setImage(document.img);

    return embed;
};

export default runner;
