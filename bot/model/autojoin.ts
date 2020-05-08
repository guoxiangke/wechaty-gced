const { db } = require('./db.config')
import { Model, DataTypes } from 'sequelize'
class Autojoin extends Model {}

;(async () => {
    Autojoin.init(
        {
            id: {
                type: DataTypes.BIGINT.UNSIGNED,
                autoIncrement: true,
                primaryKey: true
            },
            topic: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false
            }
        },
        {
            tableName: 'autojoin',
            sequelize: db // this bit is important
        }
    )
})()

export { Autojoin }
