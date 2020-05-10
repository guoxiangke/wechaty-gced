const { db } = require('./db.config')
import { MessageType } from 'wechaty-puppet'

import { Model, DataTypes } from 'sequelize'
class Message extends Model {
    public id!: number // Note that the `null assertion` `!` is required in strict mode.
    public fromId!: number // message.from() ⇒ Contact | null
    public toId!: number | null //message.to() ⇒ Contact | null
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
            msgId: {
                type: new DataTypes.STRING(64),
                unique: true,
                allowNull: false
            },
            fromId: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false
            },
            to: {
                type: DataTypes.STRING,
                allowNull: false
            },
            type: {
                type: new DataTypes.TINYINT(),
                defaultValue: MessageType.Unknown,
                allowNull: false
            },
            content: {
                //根据不同的MessageType而有的内容 如 Url/Image
                type: DataTypes.JSON, //A JSON string column. Available in MySQL, Postgres and SQLite
                allowNull: true
            }
        },
        {
            tableName: 'messages',
            indexes: [{ fields: ['to'] }],
            sequelize: db // this bit is important
        }
    )
})()

export { Message }
