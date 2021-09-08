const fetchAndCheck = require('./utils/fia.js')
const Cron = require('cron')
const Runtime = require('./utils/runtime.js')
const Moment = require('moment')

// Run this job every minute
const job = new Cron.CronJob('*/1 * * * *', () => {
  fetchAndCheck()
})

console.log('Started FIA-Douments-Discord-Webhook.')
Runtime.read()
fetchAndCheck()
job.start()
