const { db } = require('./db.config')

import { Model, DataTypes } from 'sequelize'
class Subscription extends Model {}

;(async () => {
    Subscription.init(
        {
            id: {
                type: DataTypes.BIGINT.UNSIGNED,
                autoIncrement: true,
                primaryKey: true
            },
            jobId: {
                type: DataTypes.BIGINT.UNSIGNED,
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
            offset: {
                type: DataTypes.STRING
            }
        },
        {
            tableName: 'subscriptions',
            sequelize: db
        }
    )
})()

export { Subscription }
