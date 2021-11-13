// Runtime memory structure.
// This structure supposedly holds all the data necessary at runtime.
const Runtime = {
  queue: [],
  lastDocs: [],
  first: false,
  cleaning: false,
  event: ''
}

module.exports = Runtime
