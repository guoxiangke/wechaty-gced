const { db } = require('./db.config')
import { MessageType } from 'wechaty-puppet'

import { Model, DataTypes } from 'sequelize'
class Job extends Model {}

;(async () => {
    Job.init(
        {
            id: {
                type: DataTypes.BIGINT.UNSIGNED,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            type: {
                type: DataTypes.TINYINT,
                defaultValue: MessageType.Unknown,
                allowNull: false
            },
            path: {
                // "/usr/src/app/bot/files/19_Psalm/19_${current}.mp3"
                type: DataTypes.STRING,
                allowNull: false
            },
            by: {
                //date count
                type: DataTypes.STRING(16),
                allowNull: false
            },
            count: {
                type: DataTypes.SMALLINT
            },
            pad: {
                type: DataTypes.TINYINT
            },
            fill: {
                type: DataTypes.STRING(16)
            }
        },
        {
            tableName: 'jobs',
            sequelize: db
        }
    )
})()

export { Job }
