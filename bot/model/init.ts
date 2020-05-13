const { db } = require('./db.config')
import { Contact } from './contact'
import { Room } from './room'
import { Member } from './member'
import { Message } from './message'
import { Job } from './job'
import { Subscription } from './subscription'

require('./autoreply')
require('./message')
require('./job')
require('./subscription')
require('./forward')
require('./autojoin')
require('./filebox') //  确保每个文件只存储一次

//
Contact.hasMany(Message, {
    foreignKey: 'fromId'
})
Message.belongsTo(Contact)

//
Job.hasMany(Subscription, {
    foreignKey: 'jobId'
})
Subscription.belongsTo(Job)

//roomOwner
Contact.hasMany(Room, {
    as: 'owner',
    foreignKey: 'ownerId'
})
Room.belongsTo(Contact)

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
    as: 'member'
})
Member.belongsTo(Room)

Contact.hasMany(Member, {
    foreignKey: 'contactId',
    as: 'Room'
})
Member.belongsTo(Contact)
