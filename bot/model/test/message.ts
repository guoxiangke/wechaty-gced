import { initTest } from './test'
const { Room } = require('../room')
// public id!: number // Note that the `null assertion` `!` is required in strict mode.
// public topic!: string //room.topic([newTopic]) ⇒ Promise <void | string>
// public announce!: string | null //room.announce([text]) ⇒ Promise <void | string>
// public isOwner!: number //room.owner() ⇒ Contact | null
;(async () => {
    await initTest()
    var entity = await Room.create({
        topic: 'Odie',
        announce: 'All wechat rooms(groups) will be encapsulated as a Room.',
        isOwner: true
    })
    console.log(entity.toJSON())

    var rooms = await Room.findAll({
        where: {
            topic: 'Odie'
        }
    })
    console.log(`find ${rooms.length} pets:`)
    for (let p of rooms) {
        console.log(JSON.stringify(p))
    }
})()
