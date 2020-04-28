/* eslint-disable sort-keys */
import { log, Wechaty } from 'wechaty'
import { PuppetPadplus } from 'wechaty-puppet-padplus'
// Config.autoReply 全局控制变量
import { Vars as Global } from './global-var'

import dotenv from 'dotenv'
dotenv.config()

async function initDB() {
    log.info('DB', 'rocksdb inited, now u can use Global.rocksdb')
    var levelup = require('levelup')
    var leveldown = require('leveldown')
    Global.rocksdb = await levelup(leveldown('./rocksdb'))
}

async function main() {
    const puppet = new PuppetPadplus()
    // 如何能不多次扫码登陆机器人
    // https://wechaty.js.org/v/zh/faq#login-status-persistent
    const name = process.env.WECHATY_NAME || 'grace365'
    const bot = new Wechaty({ name, puppet })
    Global.bot = bot

    // import hotImport from 'hot-import'
    // const initSchedule = await hotImport('./utils/schedule')

    await initDB()

    // const onScan = require('./listeners/on-scan')
    // const onLogin = require('./listeners/on-login')
    // const onLogout = require('./listeners/on-logout')
    // const onFriend = require('./listeners/on-friend')
    // const onRoomjoin = require('./listeners/on-roomjoin')
    // const onMessage = require('./listeners/on-message')
    // bot.on('message', (msg) => onMessage(msg, bot)) // bot.on('login', (user) => onLogin(user, bot))

    bot.on('scan', './listeners/on-scan')
    bot.on('login', './listeners/on-login')
    bot.on('ready', './listeners/on-ready')
    bot.on('logout', './listeners/on-logout')
    bot.on('message', './listeners/on-message')
    bot.on('heartbeat', () => {
        log.error('ON', 'heartbeat')
    })
    bot.on('dong', () => {
        log.error('ON', 'dong')
    })

    bot.on('room-join', (room, inviteeList, inviter) => {
        const nameList = inviteeList.map((c) => c.name()).join(',')
        log.info(`Room ${room.topic()} got new member ${nameList}, invited by ${inviter}`)
        // 如果机器人被拉到一个新的群组里, inviteeList[0] === bot.self()
    })

    bot.start()
        .then(() => log.info('Bot Started.'))
        .catch((e) => log.error('StarterBot', e))
}

main().catch((e) => log.error('StarterBot', e))
