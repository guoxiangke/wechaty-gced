import { log, Contact } from 'wechaty'

// Global.autoReply 全局控制变量
import { Vars as Global } from '../global-var'
import { Room as RoomModel } from '../model/room'
import { Member as MemberModel } from '../model/member'

import { Type, Contact as contactModel } from '../model/contact'
import { findOrCreate } from '../model/contactfindOrCreate'

/**
 * 把群主、群成员、群关系 存储/更新到数据库中
 * contacts     memember
 */

async function init() {
    for (const room of Global.allRooms) {
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
    }
    await thenAllMember()
}

async function thenAllMember() {
    //save or udpate Contact
    for (const room of Global.allRooms) {
        const contacts: Contact[] | null = await room.memberAll()
        let roomInstance = await RoomModel.findOne({
            where: { roomId: room.id }
        })
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
}

export { init }
