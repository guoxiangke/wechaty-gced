import { log, Contact, Wechaty } from 'wechaty'
import { Vars as Global } from '../global-var'

async function onLogin(user: Contact) {
    log.info(`bot ${user} login`)
    log.info(`bot name: ${user.name()}`)
    log.info(`bot id: ${user.id}`)

    const bot: Wechaty = Global.bot
    const contact = bot.userSelf()
    log.error(`Bot is ${contact.name()}`)
    log.error(`BotID is ${contact.id}`)

    Global.allRooms = await bot.Room.findAll()
    log.info('onReady', `Now you can use Global.allRooms: ${Global.allRooms}`)

    // import { init as initContacts } from '../init/contacts'
    // import { init as initRoom } from '../init/room'
    // await initRoom()
    // await initContacts()

    // 初始化 计划任务
    const initSchedule = require('../utils/schedule')
    initSchedule()
    // await require('../model/init')

    // 2.13 我的群好多，我等不了ready事件就想要操作bot的群
    // https://wechaty.js.org/v/zh/faq#too-many-rooms-to-wait
    // const room = bot.Room.load(roomId)
    // await room.sync()
    // const cron = require('node-schedule')

    // // todo 每天发一个链接
    // const tasks  = require(`${CONFIG_JSON_PATH}/schedule.json`).data
    // tasks.forEach(task => {
    //   cron.scheduleJob(task.cron, () => initTask(task, bot))
    // });
}

module.exports = onLogin
