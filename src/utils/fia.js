const fetch = require("node-fetch");
const Config = require("./config.js.js");
const Runtime = require("./runtime.js.js");
const cheerio = require("cheerio");
const Moment = require("moment");

// Retrieves the FIA documents website.
const fetchFia = async () => {
  console.log("Querying new Documents");
  const req = await fetch(Config.fiaUrl);
  if (req.ok === true) {
    const html = await req.text();
    return html;
  }
  console.log(`Encountered a ${req.status} on ${Config.fiaUrl}`);
  return "";
};

// Parses the html from the documents website, filtering out links that end in the .pdf file ext.
// Then associates those with their respective titles and dates.
// If any link has a timestamp newer than the latest update (from Runtime.lastPubDate) it gets
// sent out to the discord channel.
const parseFIA = (html) => {
  const $ = cheerio.load(html);
  try {
    const anchors = $(".event-title.active + ul a[href$=pdf]");
    const currentEvent = $(".event-title.active");
    Runtime.event = currentEvent.text();
    anchors.toArray().forEach((item) => {
      const newItem = { title: undefined, date: undefined, url: undefined };
      newItem.url = encodeURI(`https://www.fia.com${item.attribs.href}`);
      try {
        const title = $(`a[href="${item.attribs.href}"] .title`);
        newItem.title = title.first().text().trim();
      } catch (error) {
        console.log("Error when querying CSS Selector for Item Title", error);
      }
      try {
        const stringDate = $(
          `a[href="${item.attribs.href}"] .published .date-display-single`
        );
        newItem.date = Moment.tz(
          stringDate.first().text().trim(),
          "D.M.YY HH:mm",
          "Europe/Berlin"
        );
      } catch (error) {
        console.log("Error when querying CSS Selector for Item Date", error);
      }
      if (
        newItem.title !== undefined &&
        newItem.url !== undefined &&
        newItem.date !== undefined &&
        newItem.date > Moment.tz("Europe/Berlin").subtract(2, "hours")
      ) {
        if (
          !Runtime.lastDocs.find((item) => {
            return item.url === newItem.url;
          })
        ) {
          Runtime.queue.push(newItem);
          Runtime.lastDocs.push(newItem);
        }
      }
    });
  } catch (err) {
    console.log("Error when querying CSS Selector on FIA Website", err);
  }
};

const makeRequestBody = () => {
  const items = Runtime.queue
    .splice(0, 8)
    .sort((a, b) => a.date.format("x") - b.date.format("x"));
  return items.map((item) => makeEmbed(item));
};

// Creates the Embed object used for the Discord Webhook URL
const makeEmbed = (item) => {
  return {
    color: "11615",
    author: {
      name:
        Runtime.event.length > 0
          ? "FIA Document - " + Runtime.event
          : "FIA Document",
    },
    title: item.title,
    url: item.url,
    thumbnail: {
      url: "https://static.ort.dev/fiadontsueme/fia_logo.png",
    },
    description: "",
    footer: {
      text: item.date.format("lll"),
    },
  };
};

// Executes the entire Job
const fetchAndCheck = async () => {
  parseFIA(await fetchFia());
  if (Runtime.queue.length === 0) return;
  if (Runtime.first) {
    Runtime.queue.splice(0, Runtime.queue.length);
    Runtime.first = false;
    console.log("Skipping Embeds on First-start");
  }
  Runtime.queue.sort((a, b) => a.date.format("x") - b.date.format("x"));
  const sendInterval = setInterval(() => {
    const body = makeRequestBody();
    Config.hooks.forEach(async (hook) => {
      await fetch(hook, {
        method: "POST",
        body: JSON.stringify({ embeds: body }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    });
    if (body.length > 0) {
      console.log(`sent ${body.length} new embeds`);
    }
    if (Runtime.queue.length === 0) {
      clearInterval(sendInterval);
    }
  }, 500);
};

module.exports = fetchAndCheck;
