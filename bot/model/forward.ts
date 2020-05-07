const { db } = require('./db.config')

import { Model, DataTypes } from 'sequelize'

/**
 * FromType Room/Contact
 */
export enum Type {
    Room = 0,
    Contact
}
class Forward extends Model {
    public id!: number // Note that the `null assertion` `!` is required in strict mode.

    public fromType!: string // room /contact
    public fromName!: string // topic or contact alias
    public senders!: string // json

    // 转发某个群里的某几个用户的信息
    // from.type = "room"
    // from.name = roomName
    // from.senders = [{"alias": "扎根（鲍弟兄）"},{"name":"xxxx"}]

    // 转发某个联系人的信息
    // from.type = "contact"
    // from.name = contact.name()
    // from.senders = []
    public destinations!: string // json

    //转发到 某几个群里 destinations
    // destinations.type = "room"
    // destinations = [{type:"room","topic":roomName},{type:"contact","name":contact.name()}]

    public readonly createdAt!: Date
    public readonly updatedAt!: Date
}

;(async () => {
    Forward.init(
        {
            id: {
                type: DataTypes.BIGINT.UNSIGNED,
                autoIncrement: true,
                primaryKey: true
            },
            fromType: {
                type: new DataTypes.TINYINT(), // 0,1
                defaultValue: Type.Room,
                allowNull: false
            },
            fromName: {
                type: DataTypes.JSON,
                allowNull: false
            },
            senders: {
                type: DataTypes.JSON,
                allowNull: false
            },
            destinations: {
                type: DataTypes.JSON,
                allowNull: false
            }
        },
        {
            tableName: 'forwards',
            sequelize: db
        }
    )
})()

export { Forward }
