const crypto = require('crypto')
var md5 = crypto.createHash('md5')
console.log(md5.update('hello').digest('hex'))
