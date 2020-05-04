import { log } from 'wechaty'

// https://github.com/moaxaca/async-redis

const asyncRedis = require('async-redis')
const client = asyncRedis.createClient()

client.on('error', function (err) {
    log.error('REDIS', `redisSync Error ${err}`)
})

// const asyncBlock = async () => {
//     await client.set('string_key', 'string val')
//     const value = await client.get('string_key')
//     console.log(value)
//     // client.flushall('string_key')
// }
// asyncBlock()
log.info('REDIS', 'redisSync Ready to use.')

export { client as redis }
