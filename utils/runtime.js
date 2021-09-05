import fs from 'fs'
import moment from 'moment'

// Runtime memory structure.
// This structure supposedly holds all the data necessary at runtime.
const Runtime = {
  lastPubDate: null,
  channels: [],
  read: () => {
    if (fs.existsSync('./lastDate')) {
      const time = fs.readFileSync('./lastDate', { encoding: 'utf-8', flag: 'r' })
      Runtime.lastPubDate = moment(time, 'x')
      console.log('Read last publish time from file:', Runtime.lastPubDate.format('lll'))
    } else {
      fs.writeFileSync('./lastDate', '' + moment.now())
      Runtime.lastPubDate = moment.now()
      console.log('No lastDate found, creating new.')
    }
  },
  save: () => {
    fs.writeFileSync('./lastDate', '' + Runtime.lastPubDate)
  }
}

export default Runtime
