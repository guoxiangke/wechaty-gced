const { db } = require('./db.config')
import { MessageType } from 'wechaty-puppet'

import { Model, DataTypes } from 'sequelize'
class Schedule extends Model {
    public id!: number // Note that the `null assertion` `!` is required in strict mode.
    public desc!: string
    public cron!: string
    public to!: string
    public type!: number //message.type() ⇒ MessageType
    public path!: string // "/usr/src/app/bot/files/19_Psalm/19_${current}.mp3"
    public by!: number // by count or  by date
    public current!: string //json
    public readonly createdAt!: Date
    public readonly updatedAt!: Date
}

;(async () => {
    Schedule.init(
        {
            id: {
                type: DataTypes.BIGINT.UNSIGNED,
                autoIncrement: true,
                primaryKey: true
            },
            desc: {
                type: DataTypes.STRING(64),
                allowNull: false
            },
            type: {
                type: DataTypes.TINYINT(),
                defaultValue: MessageType.Unknown,
                allowNull: false
            },
            cron: {
                type: DataTypes.STRING, // * * * * *
                allowNull: false
            },
            to: {
                type: DataTypes.JSON,
                allowNull: false
            },
            path: {
                // "/usr/src/app/bot/files/19_Psalm/19_${current}.mp3"
                type: DataTypes.STRING
            },
            by: {
                type: DataTypes.STRING(32) //date count
            },
            current: {
                type: DataTypes.JSON //A JSON string column. Available in MySQL, Postgres and SQLite
            }
        },
        {
            tableName: 'schedules',
            sequelize: db // this bit is important
        }
    )
})()

export { Schedule }
