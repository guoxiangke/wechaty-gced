const { db } = require('./db.config')

import { Model, DataTypes } from 'sequelize'
class User extends Model {
    public id!: number // Note that the `null assertion` `!` is required in strict mode.
    public name!: string
    public preferredName!: string | null // for nullable fields
}

;(async () => {
    User.init(
        {
            id: {
                type: DataTypes.BIGINT.UNSIGNED,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: new DataTypes.STRING(128),
                allowNull: false
            },
            preferredName: {
                type: new DataTypes.STRING(128),
                allowNull: true
            }
        },
        {
            tableName: 'users',
            sequelize: db // this bit is important
        }
    )
})()

export { User }
