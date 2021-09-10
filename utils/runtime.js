const fs = require('fs')
const Moment = require('moment')

// Runtime memory structure.
// This structure supposedly holds all the data necessary at runtime.
const Runtime = {
  lastPubDate: null,
  queue: [],
  read: () => {
    if (fs.existsSync('./lastDate')) {
      const time = fs.readFileSync('./lastDate', { encoding: 'utf-8', flag: 'r' })
      Runtime.lastPubDate = Moment.tz(time, 'x', 'Europe/Berlin')
      console.log('Read last publish time from file:', Runtime.lastPubDate.format('lll'))
    } else {
      Runtime.save()
      console.log('No lastDate found, creating new.')
    }
  },
  save: () => {
    Runtime.lastPubDate = Moment.tz(Moment.now(), 'x', 'Europe/Berlin')
    fs.writeFileSync('./lastDate', '' + Runtime.lastPubDate.format('x'))
  },
  lastDocs: []
}

module.exports = Runtime
