const { Forward, Type } = require('../forward')

const CONFIG_JSON_PATH = '../../config'
;(async () => {
    const config = require(`${CONFIG_JSON_PATH}/forward.json`).data
    config.forEach(async (el) => {
        await Forward.create({
            fromType: Type[el.fromType.charAt(0).toUpperCase() + el.fromType.slice(1)], // room => Room
            // https://flaviocopes.com/how-to-uppercase-first-letter-javascript/ 'abc'.toUpperCase()
            fromName: el.fromName,
            senders: { data: el.senders },
            destinations: { data: el.destinations }
        })
            .then()
            .catch((e) => console.log(`${e}`))
    })
})()
