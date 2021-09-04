const Config = require('./config')
const Runtime = require('./runtime')

const fetch = require('node-fetch')
const cheerio = require('cheerio')
const moment = require('moment')
const { MessageEmbed } = require('discord.js')

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
        newItem.date = moment.tz(child.children[0].next.children[0].data, 'D.M.YY HH:mm', 'CET')
      }
      if (child.name === 'div' && child.attribs.class === 'title') {
        newItem.title = child.children[0].data.trim()
      }
    })
    items.push(newItem)
  })
  return items
}

const fetchAndCheck = async () => {
  const html = await fetchFia()
  const results = parseFIA(html)
  let bNew = false
  results.forEach((item) => {
    if (item.date.format('x') > Runtime.lastPubDate) {
      bNew = true
      const embed = new MessageEmbed()
        .setColor('#002d5f')
        .setAuthor('FIA')
        .setThumbnail('https://static.ort.dev/fiadontsueme/fia_logo.png')
        .setURL(encodeURI(item.url))
        .setDescription(item.title)
        .setTimestamp(item.date.format('x'))
        .setTitle('Decision Document')
        .setFooter(`${item.date.format('LLLL')} CET`)
      Runtime.channels.forEach((channel) => { channel.send({ embeds: [embed] }) })
    }
  })
  if (bNew) {
    Runtime.lastPubDate = moment.now()
    Runtime.save()
  }
}

module.exports = fetchAndCheck
