const { Job } = require('../job')
import { MessageType } from 'wechaty-puppet'
;(async () => {
    const CONFIG_JSON_PATH = '../../config'
    const data = require(`${CONFIG_JSON_PATH}/job.json`).data

    data.forEach(async (el) => {
        await Job.create({
            name: el.name,
            path: el.path,
            by: el.by,
            type: MessageType[el.type], //“方括号法” 使用变量动态访问对象属性
            count: el.count,
            pad: el.pad,
            fill: el.fill
        })
    })
})()
