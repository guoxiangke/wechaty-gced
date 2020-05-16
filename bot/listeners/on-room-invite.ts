import { log, Room, RoomInvitation } from 'wechaty'

import { saveRoomToDatabase } from '../helper/room'

// * @property   {Function} room-invite     -(this: Wechaty, room: Room, roomInvitation: RoomInvitation) => void <br>
// .on('room-invite', invitation => console.log('收到入群邀请：' + invitation))
async function onRoomInvite(room: Room, invitation: RoomInvitation) {
    await invitation.accept()
    // init room & contacts
    await saveRoomToDatabase(room)
    log.info(`onRoomInvite`, `${room}`)
}

module.exports = onRoomInvite
