const Config = require('./utils/config')
const Runtime = require('./utils/runtime')
const fetchAndCheck = require('./utils/fia')

const { Client, Intents } = require('discord.js')
const Cron = require('cron')
const config = require('./utils/config')

// Run this job every minute.
const job = new Cron.CronJob('* 1 * * * *', () => {
  fetchAndCheck()
}, null, true)

Runtime.client = new Client({ intents: [Intents.FLAGS.GUILD_MESSAGES] })

Runtime.client.on('ready', () => {
  config.channels.forEach((id) => {
    Runtime.client.channels.fetch(Config.channelId)
      .then((channel) => {
        Runtime.channel = channel
        Runtime.read()
        job.start()
        fetchAndCheck()
      })
      .catch(console.error)
  })
})

Runtime.client.login(Config.token)
