const fs = require('fs')
const moment = require('moment')

// Runtime memory structure.
// This structure supposedly holds all the data necessary at runtime.
const Runtime = {
  lastPubDate: null,
  channels: [],
  read: () => {
    if (fs.existsSync('./lastDate')) {
      const time = fs.readFileSync('./lastDate', { encoding: 'utf-8', flag: 'r' })
      Runtime.lastPubDate = moment(time, 'x')
    } else {
      fs.writeFileSync('./lastDate', '' + moment.now())
      Runtime.lastPubDate = moment.now()
    }
  },
  save: () => {
    fs.writeFileSync('./lastDate', '' + Runtime.lastPubDate.format('x'))
  }
}

module.exports = Runtime
