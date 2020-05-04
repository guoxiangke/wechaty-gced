import { log } from 'wechaty'

// https://github.com/moaxaca/async-redis

let redis = require('redis')
// let client = redis.createClient(6379, 'localhost')
redis = redis.createClient()
// redis 链接错误
redis.on('error', function (error) {
    log.error('REDIS', error)
})

redis.on('ready', function (error) {
    log.info('REDIS', `Ready to use.${error}`)
})

export { redis }
