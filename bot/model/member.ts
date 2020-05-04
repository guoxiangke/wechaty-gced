// roomId contaceId
const { db } = require('./db.config')

import { Model, DataTypes } from 'sequelize'
class Member extends Model {
    public id!: number
    public contactId!: number
    public roomId!: number
}

;(async () => {
    Member.init(
        {
            id: {
                type: DataTypes.BIGINT.UNSIGNED,
                autoIncrement: true,
                primaryKey: true
            },
            roomId: {
                type: DataTypes.BIGINT.UNSIGNED
            },
            contactId: {
                type: DataTypes.BIGINT.UNSIGNED
            }
        },
        {
            tableName: 'members',
            indexes: [{ unique: true, fields: ['room_id', 'contact_id'] }],
            sequelize: db // this bit is important
        }
    )
})()

export { Member }
