const { Schedule } = require('../schedule')
import { MessageType } from 'wechaty-puppet'
;(async () => {
    const CONFIG_JSON_PATH = '../../config'
    const ScheduleConfig = require(`${CONFIG_JSON_PATH}/schedule.json`).data

    ScheduleConfig.forEach(async (el) => {
        await Schedule.create({
            desc: el.name,
            cron: el.cron,
            to: { data: el.to },
            path: el.uri,
            by: el.by,
            type: MessageType[el.type], //“方括号法” 使用变量动态访问对象属性
            current: { data: el.current }
        })
            .then()
            .catch((e) => console.log(`${e}`))
    })
})()
