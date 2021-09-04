const { Client, Intents } = require('discord.js')
const fetchAndCheck = require('./utils/fia')
const Cron = require('cron')
const Config = require('./utils/config')
const Runtime = require('./utils/runtime')
let Channel = null

const job = new Cron.CronJob('0 1 * * * *', () => {
  if (Channel !== null) {
    fetchAndCheck()
  }
}, null, true)

const client = new Client({ intents: [Intents.FLAGS.GUILD_MESSAGES] })

client.on('ready', () => {
  client.channels.fetch(Config.channelId)
    .then((channel) => {
      Channel = channel
      Runtime.channel = channel
      Runtime.read()
      job.start()
      fetchAndCheck()
    })
    .catch(console.error)
})

client.login(Config.token)
