import { log } from 'wechaty'

let redis = require('redis')
let client = redis.createClient(6379, 'localhost')
// redis 链接错误
client.on('error', function (error) {
    log.error(error)
})
client.set('hello', `redis.createClient at ${new Date().toLocaleString()}`)
log.info('REDIS', 'Ready to use.')

module.exports = client
