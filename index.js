const Config = require('./utils/config')
const Runtime = require('./utils/runtime')
const fetchAndCheck = require('./utils/fia')

const { Client, Intents } = require('discord.js')
const Cron = require('cron')
const config = require('./utils/config')

// Run this job every minute.
const job = new Cron.CronJob('10 * * * * *', () => {
  fetchAndCheck()
}, null, true)

job.start()

Runtime.client = new Client({ intents: [Intents.FLAGS.GUILD_MESSAGES] })

Runtime.client.on('ready', () => {
  Runtime.read()
  config.channels.forEach((id) => {
    Runtime.client.channels.fetch(id)
      .then((channel) => {
        Runtime.channels.push(channel)
        console.log(`Added Channel ${id}(${channel.name})`)
      })
      .catch(console.error)
  })
})

Runtime.client.login(Config.token)
