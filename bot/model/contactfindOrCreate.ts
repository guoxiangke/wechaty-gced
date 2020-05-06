import { log, Contact } from 'wechaty'
import { Contact as ContactModel, Type } from './contact'

async function findOrCreate(contact: Contact, from: Type = Type.RoomMemeber) {
    let contactModel = await ContactModel.findOne({
        where: { wechatId: contact.id }
    })
    if (!contactModel) {
        contactModel = await ContactModel.create({
            wechatId: contact.id, //Get Contact id. This function is depending on the Puppet Implementation, see puppet-compatible-table
            name: contact.name(),
            alias: await contact.alias(), //(newAlias) ⇒ Promise <null | string | void>
            type: contact.type(), //contact.type() ⇒ ContactType.Unknown | ContactType.Personal | ContactType.Official
            gender: contact.gender(), //ContactGender.Unknown | ContactGender.Male | ContactGender.Female
            province: contact.province(),
            city: contact.city(),
            from: from
            // avatar: contact.avatar() //contact.avatar() ⇒ Promise <FileBox> ==> toUrl
        })
            .then()
            .catch((e) => log.error(`${e}`))
    }

    return contactModel
}

export { findOrCreate }
