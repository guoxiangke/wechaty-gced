const { Subscription } = require('../subscription')
;(async () => {
    const CONFIG_JSON_PATH = '../../config'
    const data = require(`${CONFIG_JSON_PATH}/subscription.json`).data

    data.forEach(async (el) => {
        await Subscription.create({
            jobId: el.jobId,
            cron: el.cron,
            to: { data: el.to },
            offset: el.offset
        })
    })
})()
