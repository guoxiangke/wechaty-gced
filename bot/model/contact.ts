const { db } = require('./db.config')

import { Model, DataTypes } from 'sequelize'
import { ContactType, ContactGender } from 'wechaty-puppet'

export enum Type {
    Unknown = 0,
    RoomOwner, //1 群主
    RoomMemeber, //2 群成员
    Contact //3 bot联系人
}

class Contact extends Model {
    // public id!: number // Note that the `null assertion` `!` is required in strict mode.
    // public wechatId!: string //Get Contact id. This function is depending on the Puppet Implementation, see puppet-compatible-table
    // public name!: string
    // public alias!: string | null //contact.alias(newAlias) ⇒ Promise <null | string | void>
    // public type!: number //0,1,2  (3==room) contact.type() ⇒ ContactType.Unknown | ContactType.Personal | ContactType.Official
    // public gender!: string //ContactGender.Unknown | ContactGender.Male | ContactGender.Female
    // public province!: string | null
    // public city!: string | null
    // public avatar!: string | null //contact.avatar() ⇒ Promise <FileBox>
}

;(async () => {
    Contact.init(
        {
            id: {
                type: DataTypes.BIGINT.UNSIGNED,
                autoIncrement: true,
                primaryKey: true
            },
            wechatId: {
                type: new DataTypes.STRING(32),
                unique: true,
                allowNull: false
            },
            name: {
                type: new DataTypes.STRING(64),
                allowNull: false
            },
            alias: {
                type: new DataTypes.STRING(64)
            },
            type: {
                type: new DataTypes.TINYINT(), // 0,1,2 //(3==room)
                defaultValue: ContactType.Unknown,
                allowNull: false
            },
            gender: {
                type: new DataTypes.TINYINT(), // 0,1,2
                defaultValue: ContactGender.Unknown,
                allowNull: false
            },
            province: {
                type: new DataTypes.STRING(64)
            },
            city: {
                type: new DataTypes.STRING(64)
            },
            avatar: {
                type: DataTypes.STRING
            },
            from: {
                type: new DataTypes.TINYINT(),
                defaultValue: Type.Unknown,
                allowNull: false
            }
        },
        {
            tableName: 'contacts',
            sequelize: db // this bit is important
        }
    )
})()

export { Contact }
