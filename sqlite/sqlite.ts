// DOC @see https://www.jianshu.com/p/0738e29d8af3
const Sequelize = require('sequelize')
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './sqlite/data/database.sqlite',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
    // logging: log.error,
    // timezone: '+08:00',
    define: {
        // create_time && update_time
        timestamps: true, // delete_time
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at', // 把驼峰命名转换为下划线
        underscored: true,
        scopes: {
            bh: {
                attributes: {
                    exclude: ['password', 'updated_at', 'deleted_at', 'created_at']
                }
            },
            iv: {
                attributes: {
                    exclude: ['content', 'password', 'updated_at', 'deleted_at']
                }
            }
        }
    }
})

// 创建模型
sequelize.sync({
    force: false
})

// module.exports = {
//     sequelize
// }
export { sequelize as db }
