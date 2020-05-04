import { initTest } from './test'
const { Autoreply } = require('../autoreply')

;(async () => {
    await initTest()
    var dog = await Autoreply.create({
        keyword: 'Odie',
        replyType: 'type1',
        replyContent: { name: 'name' }
    })
    console.log('created: ' + JSON.stringify(dog))

    var pets = await Autoreply.findAll({
        where: {
            keyword: 'Odie'
        }
    })
    console.log(`find ${pets.length} pets:`)
    for (let p of pets) {
        console.log(JSON.stringify(p))
    }
})()
