// * @property   {Function} room-topic      -(this: Wechaty, room: Room, newTopic: string, oldTopic: string, changer: Contact) => void
import { log, Room, Contact } from 'wechaty'

import { Room as RoomModel } from '../model/room'

async function onRoomTopic(room: Room, newTopic: string, oldTopic: string, changer: Contact) {
    //允许bot修改群名
    if (!changer.self()) {
        const owner = room.owner()
        if (!owner) return

        const isOwner = owner.self()

        // bot是群主,rollback
        if (isOwner) {
            await room.topic(oldTopic)
            await room.say(`请勿随意更改群名`, changer)
        } else {
            //更新数据库 群名称
            updateTopic(room, newTopic)
        }
    } else {
        //更新数据库 群名称
        updateTopic(room, newTopic)
    }
}

async function updateTopic(room: Room, newTopic: string) {
    const aRoom: RoomModel = await RoomModel.findOne({
        where: { roomId: room.id }
    })
    aRoom.update({ topic: newTopic })
    log.info('RoomTopicUpdated', `${room}=>${newTopic}`)
}
module.exports = onRoomTopic
