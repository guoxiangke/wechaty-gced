import { initTest } from './test'
import { ContactType, ContactGender } from 'wechaty-puppet'
const { Contact } = require('../contact')

// public id!: number // Note that the `null assertion` `!` is required in strict mode.
// public wechatyId!: string //Get Contact id. This function is depending on the Puppet Implementation, see puppet-compatible-table
// public name!: string
// public alias!: string | null //contact.alias(newAlias) ⇒ Promise <null | string | void>
// public type!: number //contact.type() ⇒ ContactType.Unknown | ContactType.Personal | ContactType.Official
// public gender!: string //ContactGender.Unknown | ContactGender.Male | ContactGender.Female
// public province!: string | null
// public city!: string | null
// public avatar!: string | null //contact.avatar() ⇒ Promise <FileBox> ==> toUrl

;(async () => {
    await initTest()
    var entity = await Contact.create({
        wechatyId: 'wx_id_xxx2',
        name: 'juzhibot',
        alias: 'orange',
        type: ContactType.Unknown,
        gender: ContactGender.Male,
        province: 'province',
        city: 'city',
        avatar: 'avatar'
    })
    console.log(entity.toJSON())

    var rooms = await Contact.findAll({
        where: {
            wechatyId: 'wx_id_xxx2'
        }
    })
    console.log(`find ${rooms.length} pets:`)
    for (let p of rooms) {
        console.log(JSON.stringify(p))
    }
})()
