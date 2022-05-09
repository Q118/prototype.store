const fs = require('fs')

const file = ('./access.log')
const stream = fs.createWriteStream(file, { flags: 'a' })
//! use a stream so its efficient. stream in the data from the log file into azure, creating a new blob for each {} and the title of each blob file to be the GUID.
