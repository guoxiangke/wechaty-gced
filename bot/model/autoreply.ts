const { db } = require('./db.config')
import { Model, DataTypes } from 'sequelize'
import { MessageType } from 'wechaty-puppet'
class Autoreply extends Model {}

;(async () => {
    Autoreply.init(
        {
            id: {
                type: DataTypes.BIGINT.UNSIGNED,
                autoIncrement: true,
                primaryKey: true
            },
            keyword: {
                type: new DataTypes.STRING(),
                unique: true,
                allowNull: false
            },
            type: {
                type: DataTypes.TINYINT,
                defaultValue: MessageType.Unknown,
                allowNull: false
            },
            content: {
                type: DataTypes.JSON, // A JSON string column. Available in MySQL, Postgres and SQLite
                allowNull: false
            }
        },
        {
            tableName: 'autoreply',
            sequelize: db // this bit is important
        }
    )
})()

export { Autoreply }
