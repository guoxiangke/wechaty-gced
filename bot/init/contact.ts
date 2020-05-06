import { Contact, Wechaty } from 'wechaty'
import { Type } from '../model/contact'
import { findOrCreate } from '../model/contactfindOrCreate'
import { Vars as Global } from '../global-var'

/**
 * init contacts and rooms
 * 把联系人存储在数据库中
 */

async function init(type: Type = Type.Contact) {
    const bot: Wechaty = Global.bot
    const contactList: Contact[] | null = await bot.Contact.findAll()
    for (const contact of contactList) {
        // contactList
        findOrCreate(contact, type)
    }
}

export { init }
