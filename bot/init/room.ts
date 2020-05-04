import { log, Contact } from 'wechaty'

// Global.autoReply 全局控制变量
import { Vars as Global } from '../global-var'
import { Room as RoomModel } from '../model/room'
import { Member as MemberModel } from '../model/member'

import { Type, Contact as contactModel } from '../model/contact'
import { findOrCreate } from '../model/contactfindOrCreate'

/**
 * init contacts and rooms
 * 把群主、群成员、群 存储在数据库中
 */

async function init() {
    for (const room of Global.allRooms) {
        const owner: Contact | null = await room.owner()
        if (!owner) return

        let contact: contactModel | any = await findOrCreate(owner, Type.RoomOwner)
        if (!contact) return

        log.error('RoomInit', `'${contact.wechat_id}'=>${contact}`)

        // save contact end

        let roomModel = await RoomModel.findOne({
            where: { roomId: room.id }
        })

        if (!roomModel) {
            log.error(`room not exsits: ${room.id}, Create and get all members`)
            await RoomModel.create({
                roomId: room.id,
                topic: await room.topic(), //room.topic([newTopic]) ⇒ Promise <void | string>
                announce: await room.announce(), //room.announce([text]) ⇒ Promise <void | string>
                ownerId: contact.id //string // room.owner() ⇒ Contact | null  => Contact.id
            })
                .then()
                .catch((e) => console.log(`${e}`))
        }
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
        for (const contact of contacts) {
            const contactInstance = await findOrCreate(contact, Type.RoomMemeber)

            log.error('thenAllMember', `${roomInstance.id} - ${contactInstance.id}`)
            // roomInstance.addMembers(contactInstance)
            // contactInstance.addRoom(roomInstance)
            await MemberModel.create({
                roomId: roomInstance.id,
                contactId: contactInstance.id //room.topic([newTopic]) ⇒ Promise <void | string>
            })
                .then()
                .catch((e) => console.log(`${e}`))
        }
        // log.error('Await getContacts', await roomInstance.getContacts())
    }
}

export { init }
