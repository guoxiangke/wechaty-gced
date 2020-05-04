import { redis as redisSync } from '../redis/redisSync'
import { redis } from '../redis/redis'
import { log } from 'wechaty'

const test = async () => {
    redis.set('hello', 'world2', function (err, v) {
        if (err) log.error('REDIS', err)
        log.info('REDIS v', v)
    })
    log.info('REDIS v2', await redisSync.get('hello'))

    // redis.quit() //关闭
    // /https://cnodejs.org/topic/584fb72e9ff0dbf333450a15

    // 如果使用了连接 redis 或者 mysql 的库，一般需要在程序执行完后手动断开连接，否则会保持连接，程序不会退出
    // return //todo 为啥不退出？
    process.exit(1)
}

test()

process.on('exit', function () {
    redis.quit()
})

process.on('SIGINT', function () {
    redis.quit()
    console.log('redis client quit')
})
