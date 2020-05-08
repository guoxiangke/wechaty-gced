import { log } from 'wechaty'
// import { FileBox } from 'file-box'
// import { RedisClient } from 'redis'
// const redis: RedisClient = Global.redis

async function onReady() {
    log.info('onReady')
    // https://wechaty.js.org/v/zh/faq#room-list-not-complete
    // const redisSync: any = Global.redisSync
    // //初始化 redis
    // const REDIS_INIT_AT = `${contact.id}_inited_at`
    // // 1.如果没有 key=BotID_inited, 加载各种config.json to redis.
    // let init_at = await redisSync.get(REDIS_INIT_AT)
    // log.error('REDIS_INIT_AT1', init_at)
    // // await aRedis.set(REDIS_INIT_AT, Date.now())
    // init_at = await redisSync.get(REDIS_INIT_AT)
    // log.error('REDIS_INIT_AT2', init_at)
}

module.exports = onReady
