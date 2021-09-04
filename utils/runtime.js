const fs = require('fs')
const moment = require('moment')

const Runtime = {
  lastPubDate: null,
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
