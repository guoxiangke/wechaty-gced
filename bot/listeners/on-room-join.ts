import { log, Room, Contact } from 'wechaty'

async function onRoomJoin(room: Room, inviteeList: Array<Contact>, inviter: Contact) {
    log.warn('onRoomJoin', 'room: %s  inviteeList:%s Contact:%s ', room, inviteeList, inviter)
}

module.exports = onRoomJoin
