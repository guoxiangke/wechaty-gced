import { initTest } from './test'
const { User } = require('../user')

;(async () => {
    initTest()
    const { db } = require('../db.config')
    await db.sync({ force: true })
    var dog = await User.create({
        name: 'Odie'
    })
    console.log('created: ' + JSON.stringify(dog))

    var pets = await User.findAll({
        where: {
            name: 'Odie'
        }
    })
    console.log(`find ${pets.length} pets:`)
    for (let p of pets) {
        console.log(JSON.stringify(p))
    }
})()
