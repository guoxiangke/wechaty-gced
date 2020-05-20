import { log, Contact, Wechaty, Room } from 'wechaty'
import { Vars as Global } from '../global-var'
import { Autojoin } from '../model/autojoin'

async function onLogin(user: Contact) {
    log.info(`bot ${user} login`)
    log.info(`bot name: ${user.name()}`)
    log.info(`bot id: ${user.id}`)

    const bot: Wechaty = Global.bot
    const contact = bot.userSelf()
    log.error(`Bot is ${contact.name()}`)
    log.error(`BotID is ${contact.id}`)

    let allRooms = await bot.Room.findAll()
    Global.allRooms = allRooms

    // 读取数据库配置
    let autoJoinRooms: Array<Room> = []
    let autoJoinRoomTopics: Array<String> = []
    const rooms = await Autojoin.findAll()
    rooms.forEach(async (room) => {
        autoJoinRoomTopics.push(room.topic)
    })

    //只处理最后一个同名的群，忽略其他同名群
    let indexRooms: Array<Room> = []
    let myRooms: Array<Room> = []
    allRooms.map(async (room) => {
        const topic = await room.topic()
        indexRooms[topic] = room
        const owner: Contact | null = room.owner()
        if (owner && owner.self()) {
            myRooms[topic] = room
        }
        // 加入到内存
        if (autoJoinRoomTopics.includes(topic)) {
            autoJoinRooms[topic] = room
        }
    })
    Global.indexRooms = indexRooms
    Global.myRooms = myRooms
    Global.autoJoinRooms = autoJoinRooms
    /**
     * 初始化
     * 存储/更新 所有联系人和聊天室 from wxbot
     * 存储/更新 计划任务 from db
     */
    await require('../init/index')

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
