const fetchAndCheck = require('./utils/fia.js')
const Cron = require('cron')
const Runtime = require('./utils/runtime.js')
const Moment = require('moment')

// Run this job every minute
const job = new Cron.CronJob('*/1 * * * *', () => {
  fetchAndCheck()
})

const cleanJob = new Cron.CronJob('*/30 * * * *', () => {
  const indicesToClean = []
  Runtime.lastDocs.forEach((item, idx) => {
    if (item.date < Moment().subtract(2, 'hour')) {
      indicesToClean.push(idx)
    }
  })
  indicesToClean.forEach((index) => {
    Runtime.lastDocs.splice(index, 1)
  })
  console.log('Running Cleanup.')
})

console.log('Started FIA-Douments-Discord-Webhook.')
Runtime.read()
fetchAndCheck()
job.start()
cleanJob.start()
