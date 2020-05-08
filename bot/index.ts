/* eslint-disable sort-keys */
import { log, Wechaty } from 'wechaty'
import { PuppetPadplus } from 'wechaty-puppet-padplus'
// Config.autoReply 全局控制变量
import { Vars as Global } from './global-var'

// import { redis } from '../redis/redis'
// import { redis as redisSync } from '../redis/redisSync'
// import moment from 'moment'

import dotenv from 'dotenv'
dotenv.config()

function startBot() {
    // const onScan = require('./listeners/on-scan')
    // const onLogin = require('./listeners/on-login')
    // const onLogout = require('./listeners/on-logout')
    // const onFriend = require('./listeners/on-friend')
    // const onRoomjoin = require('./listeners/on-roomjoin')
    // const onMessage = require('./listeners/on-message')
    // bot.on('message', (msg) => onMessage(msg, bot)) // bot.on('login', (user) => onLogin(user, bot))

    const bot = Global.bot

    bot.on('scan', './listeners/on-scan')
    bot.on('login', './listeners/on-login')
    bot.on('ready', './listeners/on-ready')
    bot.on('logout', './listeners/on-logout')
    bot.on('message', './listeners/on-message')
    //
    bot.on('heartbeat', './listeners/on-heartbeat')
    // 入群发送欢迎消息/群公告 @see ./config/autojoin.json
    bot.on('room-join', './listeners/on-room-join')

    bot.start()
        .then(() => log.info('Bot Started.'))
        .catch((e) => log.error('StarterBot', e))
}

async function main() {
    await initDataBase()
    await initBot()
    startBot()
}
main().catch((e) => log.error('StarterBot', e))

// functions wrapper begin

async function initBot() {
    const puppet = new PuppetPadplus()
    // 如何能不多次扫码登陆机器人
    // https://wechaty.js.org/v/zh/faq#login-status-persistent
    const name = process.env.WECHATY_NAME || 'grace365'
    const bot = new Wechaty({ name, puppet })
    Global.bot = bot
}

async function initDataBase() {
    var levelup = require('levelup')
    var leveldown = require('leveldown')
    Global.rocksdb = await levelup(leveldown('../rocksdb'))
    log.error('DB', 'inited Global.rocksdb')
    // Global.redis = redis
    // Global.redisSync = redisSync

    // log.info('DB', 'inited Global.redis and Global.aRedis')

    // //初始化 redis
    // const REDIS_LAST_INIT_AT = `REDIS_LAST_INIT_AT`
    // // 1.如果没有 key=BotID_inited, 加载各种config.json to redis.
    // let init_at = await redisSync.get(REDIS_LAST_INIT_AT)
    // if (!init_at) {
    //     log.warn(`No value of init_at`)
    // }
    // log.error('REDIS_LAST_INIT_AT1:', init_at)
    // await redisSync.set(REDIS_LAST_INIT_AT, moment().format('YYMMDD HH:II:SS'))
    // init_at = await redisSync.get(REDIS_LAST_INIT_AT)
    // log.error('REDIS_LAST_INIT_AT2:', init_at)
}
// functions wrapper end
