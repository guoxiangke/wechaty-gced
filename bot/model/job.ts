const { db } = require('./db.config')
import { MessageType } from 'wechaty-puppet'

import { Model, DataTypes } from 'sequelize'
class Message extends Model {
    public id!: number // Note that the `null assertion` `!` is required in strict mode.
    public fromId!: number // message.from() ⇒ Contact | null
    public toId!: number | null //message.to() ⇒ Contact | null
    public roomId!: number | null //message.room() ⇒ Room | null
    public type!: number | null //message.type() ⇒ MessageType
    public text!: string | null // for nullable fields
    public content!: string | null // for nullable fields

    public readonly createdAt!: Date
    public readonly updatedAt!: Date
}

;(async () => {
    Message.init(
        {
            id: {
                type: DataTypes.BIGINT.UNSIGNED,
                autoIncrement: true,
                primaryKey: true
            },
            fromId: {
                type: DataTypes.BIGINT.UNSIGNED
            },
            toId: {
                type: DataTypes.BIGINT.UNSIGNED
            },
            roomId: {
                type: DataTypes.BIGINT.UNSIGNED
            },
            type: {
                type: new DataTypes.TINYINT(),
                defaultValue: MessageType.Unknown,
                allowNull: false
            },
            text: {
                type: DataTypes.TEXT
            },
            content: {
                //根据不同的MessageType而有的内容 如 Url/Image
                type: DataTypes.JSON, //A JSON string column. Available in MySQL, Postgres and SQLite
                allowNull: true
            }
        },
        {
            tableName: 'jobs',
            sequelize: db // this bit is important
        }
    )
})()

export { Message }
