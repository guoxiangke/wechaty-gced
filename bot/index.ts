/* eslint-disable sort-keys */
import { log, Wechaty } from 'wechaty'
import { PuppetPadplus } from 'wechaty-puppet-padplus'
// Config.autoReply 全局控制变量
import { Vars as Global } from './global-var'

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
    bot.on('heartbeat', './listeners/on-heartbeat')

    bot.on('room-join', (room, inviteeList, inviter) => {
        const nameList = inviteeList.map((c) => c.name()).join(',')
        log.info(`Room ${room.topic()} got new member ${nameList}, invited by ${inviter}`)
        // 如果机器人被拉到一个新的群组里, inviteeList[0] === bot.self()
    })

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

function initBot() {
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
    log.info('DB', 'inited Global.rocksdb')

    Global.redis = await require('../redis/client')
    log.info('DB', 'inited Global.redis')

    checkRedis()
}

function checkRedis() {
    let client = Global.redis
    client.get('hello', function (err, v) {
        if (err) log.error('REDIS', err)
        log.info('REDIS', v)
    })
}
// functions wrapper end
