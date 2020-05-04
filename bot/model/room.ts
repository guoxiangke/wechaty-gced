const { db } = require('./db.config')

import { Model, DataTypes } from 'sequelize'

class Room extends Model {
    // public id!: number // Note that the `null assertion` `!` is required in strict mode.
    // public topic!: string //room.topic([newTopic]) ⇒ Promise <void | string>
    // public announce!: string | null //room.announce([text]) ⇒ Promise <void | string>
    // public owner!: string // room.owner() ⇒ Contact | null  => Contact.id
}

;(async () => {
    Room.init(
        {
            id: {
                type: DataTypes.BIGINT.UNSIGNED,
                autoIncrement: true,
                primaryKey: true
            },
            roomId: {
                type: new DataTypes.STRING(32),
                unique: true,
                allowNull: false
            },
            topic: {
                type: DataTypes.STRING(64),
                allowNull: false
            },
            announce: {
                type: DataTypes.STRING()
            },
            ownerId: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false
            }
        },
        {
            tableName: 'rooms',
            // Using `unique: true` in an attribute above is exactly the same as creating the index in the model's options:
            indexes: [{ fields: ['room_id'] }],
            sequelize: db // this bit is important
        }
    )
})()

export { Room }
