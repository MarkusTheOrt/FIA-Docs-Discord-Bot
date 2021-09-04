const Config = require('./config')
const fetch = require('node-fetch')
const cheerio = require('cheerio')
const moment = require('moment')
const Runtime = require('./runtime')
const { MessageEmbed } = require('discord.js')

const fetchFia = async () => {
  const req = await fetch(Config.fiaUrl)
  const html = await req.text()
  return html
}

const parseFIA = (html) => {
  const $ = cheerio.load(html)
  const anchors = $('a')
  const items = []
  anchors.toArray().forEach((item) => {
    if (item.attribs.href.endsWith('.pdf')) {
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
    }
  })
  return items
}

const fetchAndCheck = async () => {
  if (Runtime.channel === undefined) return
  const html = await fetchFia()
  const results = parseFIA(html)
  results.forEach((item) => {
    if (item.date > Runtime.lastPubDate) {
      const embed = new MessageEmbed()
        .setColor('#002d5f')
        .setAuthor('FIA')
        .setThumbnail('https://static.ort.dev/pub/brave_OPF8YCknDX.png')
        .setURL(encodeURI(item.url))
        .setDescription(item.title)
        .setTimestamp(item.date.format('x'))
        .setTitle('Decision Document')
        .setFooter(`${item.date.format('LLLL')} CET`)
      Runtime.channel.send({ embeds: [embed] })
    }
  })
  Runtime.lastPubDate = moment(moment.now(), 'x')
  Runtime.save()
}

module.exports = fetchAndCheck
