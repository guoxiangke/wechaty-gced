import { log, Room, Contact } from 'wechaty'

import { Room as RoomModel } from '../model/room'
import { Member as MemberModel } from '../model/member'

import { Type, Contact as contactModel } from '../model/contact'
import { findOrCreate } from '../model/contactfindOrCreate'

// module.exports =

export { saveRoomToDatabase }

// save room into db
async function saveRoomToDatabase(room: Room) {
    const owner: Contact | null = await room.owner()
    if (!owner) return

    let contact: contactModel | any = await findOrCreate(owner, Type.RoomOwner)
    if (!contact) return

    await RoomModel.findOrCreate({
        where: { roomId: room.id },
        defaults: {
            roomId: room.id,
            topic: await room.topic(), //room.topic([newTopic]) ⇒ Promise <void | string>
            announce: await room.announce(), //room.announce([text]) ⇒ Promise <void | string>
            ownerId: contact.id //string // room.owner() ⇒ Contact | null  => Contact.id
        }
    })
        .then()
        .catch((e) => log.error(`${e}`))
    log.info('RoomInit', `${room.id}, '${contact.wechatId}'=>${contact.name}`)

    await thenSaveMemberToDatabase(room)
}

async function thenSaveMemberToDatabase(room: Room) {
    const contacts: Contact[] | null = await room.memberAll()
    let roomInstance = await RoomModel.findOne({
        where: { roomId: room.id }
    })
    if (!roomInstance) {
        log.error('RoomInitAllMembers', `!roomInstance`)
        return
    }
    log.verbose('RoomInitAllMembers', `${roomInstance.id}`)
    for (const contact of contacts) {
        const contactInstance = await findOrCreate(contact, Type.RoomMemeber)
        // roomInstance.addMembers(contactInstance)
        // contactInstance.addRoom(roomInstance)
        await MemberModel.findOrCreate({
            where: {
                roomId: roomInstance.id,
                contactId: contactInstance.id
            }
        })
            .then()
            .catch((e) => log.error(`${e}`))
    }
}
