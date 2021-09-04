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
      Runtime.lastPubDate = moment(time, 'X')
    } else {
      fs.writeFileSync('./lastDate', '' + moment().format('X'))
      Runtime.lastPubDate = moment().format('X')
    }
  },
  save: () => {
    fs.writeFileSync('./lastDate', '' + Runtime.lastPubDate)
  }
}

module.exports = Runtime
