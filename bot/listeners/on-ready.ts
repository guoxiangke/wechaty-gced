import { log, Wechaty } from 'wechaty'
import { Vars as Global } from '../global-var'
const bot: Wechaty = Global.bot

async function onReady() {
    log.info(`onReady`)
    // https://wechaty.js.org/v/zh/faq#room-list-not-complete
    log.error(`onReady`, `${Global.allRooms}`)
    Global.allRooms = await bot.Room.findAll()
    log.info(
        'onReady',
        `Now you can use Global.allRooms instead of bot.Room.findAll(): ${Global.allRooms}`
    )
    // Then we can use on ther TS file like blow:
    // let allRooms = Global.allRooms

    // // 4dev
    // allRooms.forEach((room:Room) => {
    //     log.verbose(`${room}:${room.id}`)
    // })
}

module.exports = onReady
