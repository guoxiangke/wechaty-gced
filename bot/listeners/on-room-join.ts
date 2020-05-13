import { log, Room, Contact } from 'wechaty'

async function onRoomJoin(room: Room, inviteeList: Array<Contact>, inviter: Contact) {
    // 如果机器人被拉到一个新的群组里, inviteeList[0] === bot.self()
    // const nameList = inviteeList.map((c) => c.name()).join(',')
    log.warn('onRoomJoin', 'room: %s  inviteeList:%s Contact:%s ', room, inviteeList, inviter)

    // 更新 contacts 表
}

module.exports = onRoomJoin
