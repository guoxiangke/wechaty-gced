const { Autojoin } = require('../autojoin')

;(async () => {
    const CONFIG_JSON_PATH = '../../config'
    const config = require(`${CONFIG_JSON_PATH}/roomAutoJoin.json`).data

    config.forEach(async (element) => {
        await Autojoin.create({
            topic: element.topic
        })
            .then()
            .catch((e) => console.log(`${e}`))
    })
})()
