const { db } = require('./db.config')
import { Contact } from './contact'
// import { Message } from './message'
import { Room } from './room'
import { Member } from './member'
// import { HasMany } from 'sequelize/types'

require('./autoreply')
require('./message')
require('./schedule')
require('./forward')
require('./autojoin')

// //
// Contact.hasMany(Message, {
//     foreignKey: 'fromId'
// })
// Message.belongsTo(Contact)

// //
// Room.hasMany(Message, {
//     foreignKey: 'roomId'
// })
// Message.belongsTo(Room)

// todo: roomOwner //
// Contact.hasMany(Room, {
//     foreignKey: 'ownerId'
// })
// Room.belongsTo(Contact)

// const Movie = sequelize.define('Movie', { name: DataTypes.STRING });
// const Actor = sequelize.define('Actor', { name: DataTypes.STRING });
// Movie.belongsToMany(Actor, { through: 'ActorMovies' });
// Actor.belongsToMany(Movie, { through: 'ActorMovies' });

// 创建模型
db.sync({
    force: true
})

// Member
// Contact HasMany Room 1个用户可以在多个群里
// Room HasMany Contact 1个群可以有多个用户
// Foo.hasMany(Bar)
// Contact.belongsToMany(Room, { through: Member })
// Room.belongsToMany(Contact, { through: 'members' })

Room.hasMany(Member, {
    foreignKey: 'roomId',
    as: 'Contact'
})
Member.belongsTo(Room)

Contact.hasMany(Member, {
    foreignKey: 'contactId',
    as: 'Room'
})
Member.belongsTo(Contact)
