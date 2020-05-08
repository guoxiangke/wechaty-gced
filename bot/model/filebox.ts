const { db } = require('./db.config')
import { Model, DataTypes } from 'sequelize'
class FileBox extends Model {}

//  确保每个文件只存储一次
;(async () => {
    FileBox.init(
        {
            id: {
                type: DataTypes.BIGINT.UNSIGNED,
                autoIncrement: true,
                primaryKey: true
            },
            md5: {
                type: DataTypes.STRING(32),
                unique: true,
                allowNull: false
            },
            path: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false
            }
        },
        {
            tableName: 'files',
            sequelize: db // this bit is important
        }
    )
})()

export { FileBox }
