import fetchAndCheck from './utils/fia.js'
import Cron from 'cron'
import Runtime from './utils/runtime.js'

// Run this job every minute
const job = new Cron.CronJob('*/1 * * * *', () => {
  fetchAndCheck()
})

Runtime.read()
fetchAndCheck()
job.start()
