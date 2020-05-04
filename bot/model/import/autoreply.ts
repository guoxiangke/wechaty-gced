const { Autoreply } = require('../autoreply')
import { MessageType } from 'wechaty-puppet'

const CONFIG_JSON_PATH = '../../config'
;(async () => {
    // await require('../init')
    const autoReplyConfig = require(`${CONFIG_JSON_PATH}/autoReply.json`).data

    autoReplyConfig.forEach(async (element) => {
        await Autoreply.create({
            keyword: element.key,
            type: MessageType[element.reply.type], //“方括号法” 使用变量动态访问对象属性
            content: { data: element.reply.content }
        })
            .then()
            .catch((e) => console.log(`${e}`))
    })
})()
