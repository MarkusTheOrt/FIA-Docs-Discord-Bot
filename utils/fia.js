import fetch from 'node-fetch'
import Config from './config.js'
import Runtime from './runtime.js'
import cheerio from 'cheerio'
import moment from 'moment'

// Retrieves the FIA documents website.
const fetchFia = async () => {
  const req = await fetch(Config.fiaUrl)
  const html = await req.text()
  return html
}

// Parses the html from the documents website, filtering out links that end in the .pdf file ext.
// Then associates those with their respective titles and dates.
// If any link has a timestamp newer than the latest update (from Runtime.lastPubDate) it gets
// sent out to the discord channel.
const parseFIA = (html) => {
  const $ = cheerio.load(html)
  const anchors = $('a[href$=pdf]')
  const items = []
  anchors.toArray().forEach((item) => {
    const newItem = {}
    newItem.url = `https://www.fia.com${item.attribs.href}`
    item.childNodes.forEach((child) => {
      if (child.name === 'div' && child.attribs.class === 'published') {
        newItem.date = moment.tz(child.children[0].next.children[0].data, 'D.M.YY HH:mm', 'Europe/Berlin')
      }
      if (child.name === 'div' && child.attribs.class === 'title') {
        newItem.title = child.children[0].data.trim()
      }
    })
    if (newItem.date > moment(Runtime.lastPubDate, 'x')) {
      items.push(newItem)
    }
  })
  return items
}

const makePostContent = (items) => {
  return JSON.stringify({
    embeds: items.map((item) => {
      return {
        color: '11615',
        author: {
          name: 'FIA'
        },
        title: 'Decision Document',
        url: encodeURI(item.url),
        thumbnail: {
          url: 'https://static.ort.dev/fiadontsueme/fia_logo.png'
        },
        description: item.title,
        footer: {
          text: item.date.format('lll')
        }
      }
    })
  })
}

const fetchAndCheck = async () => {
  console.log('fetching new entries')
  const html = await fetchFia()
  // Post in correct order
  const newItems = parseFIA(html).sort((a, b) => a.date > b.date)
  const body = makePostContent(newItems)
  Config.hooks.forEach(async (hook) => {
    await fetch(hook, {
      method: 'POST',
      body: body,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  })
  if (newItems.length > 0) {
    console.log(`Found ${newItems.length} new Entries`)
    Runtime.lastPubDate = moment.now()
    Runtime.save()
  }
}

export default fetchAndCheck
