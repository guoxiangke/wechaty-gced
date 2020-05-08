import { log, Contact, Message, Wechaty, UrlLink, Room } from 'wechaty'
import { MessageType } from 'wechaty-puppet'

import { Autoreply } from '../model/autoreply'
import { Autojoin } from '../model/autojoin'
import { FileBox } from '../model/filebox'
const crypto = require('crypto')
// Global.autoReply 全局控制变量
import { Vars as Global } from '../global-var'
const bot: Wechaty = Global.bot

// import { RedisClient } from 'redis'
// const redis: RedisClient = Global.redis
import { Message as MsgModel } from '../model/message'

import { Forward as ForwardModel, Type as ForwardType } from '../model/forward'

const xml_to_json = require('../utils/xml-to-json')
// 关键词聊天（非群聊）默认开启，bot回复#off给filehelper关闭
Global.autoReply = true
// const CONFIG_JSON_PATH = '../config'

async function onMessage(msg: Message) {
    log.error('onMessage', `${msg}`)
    // Handle Exception
    if (msg.age() > 300) {
        log.warn('onMessage', 'Message discarded because its TOO OLD(than 5 minute)')
        return
    }
    const sender: Contact | null = msg.from()
    if (!sender) {
        log.warn('onMessage', `no msg.from()!`)
        return
    }

    const text = msg.text()
    const room = msg.room()
    const from = msg.from()
    const to = msg.to()

    let type: number | any = msg.type()

    if (type === MessageType.Recalled) {
        // Recalled 不支持转发，无法撤回
        return
    }
    const filehelper = bot.Contact.load('filehelper')

    let msgSenderAlias = await sender.alias()
    // bot本身无法通过alias获取群昵称
    if (!msgSenderAlias) {
        msgSenderAlias = await sender.name()
    }

    // todo 指定公众号消息的第X条消息转发到指定群里

    // 处理群消息
    if (room) {
        const hostRoom: Room = room
        const topic: string = await room.topic()
        const allRooms = Global.allRooms ? Global.allRooms : await bot.Room.findAll()
        // 万群群发！
        // 主人群的每条消息/bot发的消息，都群发给bot的所有群！
        const ownerGroupName: string = process.env.FORWOARD_ALL || 'FORWOARD_ALL'
        if (topic === ownerGroupName) {
            log.info('onMessage', `FORWOARD_ALL: ${allRooms}`)
            allRooms.forEach((room) => {
                if (room === hostRoom) return //不再次转发到源群
                return msg.forward(room)
            })
        }

        // 经典转发
        // todo UI config!

        // const forwards = require(`${CONFIG_JSON_PATH}/forward.json`).data
        const forwards = await ForwardModel.findAll({ where: { fromType: ForwardType.Room } })

        for (let forward of forwards) {
            const destinations = forward.destinations.data

            //转发群消息
            if (topic === forward.fromName) {
                //如果是来自于 配置要群发的群
                //如果 发送者 在配置中
                if (forward.senders.data.includes(msgSenderAlias)) {
                    // return "Element found!!";
                    destinations.forEach(async (to) => {
                        let unknownMsg: any
                        if (type == MessageType.Unknown) {
                            //MessageType.Unknown
                            const jsonPayload = await xml_to_json.xmlToJson(text)
                            if (jsonPayload.msg.appmsg.type == 3) {
                                // type = 'MusicLink' // 15 Music

                                // 解析 Music xml to new msg filebox
                                //msg.appmsg.title = 【620】旷野吗哪
                                //msg.appmsg.des = 点击▶️收听 公众号:云彩助手 每日更新
                                //msg.appmsg.type = 3
                                //msg.appmsg.url = http://lyw/ly/audio/2020/mw/mw200507.mp3
                                //msg.appmsg.lowurl = http://lym/ly/audio/2020/mw/mw200507.mp3
                                //msg.appmsg.dataurl = http://lywxaudio/2020/mw/mw200507.mp3

                                unknownMsg = new UrlLink({
                                    description: jsonPayload.msg.appmsg.des + ' 点击[浮窗]后台播放',
                                    thumbnailUrl:
                                        'https://res.wx.qq.com/a/wx_fed/assets/res/OTE0YTAw.png',
                                    title: jsonPayload.msg.appmsg.title,
                                    url: jsonPayload.msg.appmsg.url
                                })
                            }
                            // 33 小程序
                            //msg.appmsg.title = 最新传来！白头牧师又出现,这次讲道更精彩!!全场入神...
                            //msg.appmsg.type = 33
                            //。url
                        }
                        if (to.type === 'room' && to.topic in Global.indexRooms) {
                            let room = Global.indexRooms[to.topic]
                            if (type !== MessageType.Unknown) {
                                log.info('onMessage', `FORWOARD_TO ${room}`)
                                await msg.forward(room)
                            } else {
                                await room.say(unknownMsg)
                            }
                        }
                        if (to.type === 'contact') {
                            //转发给个人
                            // https://github.com/wechaty/wechaty/issues/1217  Contact.find(error!)
                            let who = await bot.Contact.find({ alias: to.alias })
                            if (who) {
                                if (type !== MessageType.Unknown) {
                                    log.info('onMessage', `FORWOARD_TO ${who}`)
                                    await msg.forward(who)
                                } else {
                                    await who.say(unknownMsg)
                                }
                            }
                        }
                    })
                }
            }
        }

        // #群挑战#
        if (false) {
            const challenge = require('./common/challenge')
            challenge(msg, room, text, sender, msgSenderAlias)
        }
    } else {
        // 处理个人消息
        // bot 主动发消息到个人
        // bot 主动发消息到群，没有msg.to()
        const receiver: Contact | null = msg.to()
        if (!receiver) {
            log.warn('onMessage', `no msg.to()!`)
            return
        }
        // let autoReply = false
        // let aiReply = false
        // 自己发给filehelper
        if (receiver.id === 'filehelper') {
            // bot作为系统管理员，处理bot发出的指令处理
            const keyword = text.toLowerCase().replace('#', '') // #On #off
            switch (keyword) {
                case 'on':
                case 'off':
                    Global.autoReply = !Global.autoReply
                    await filehelper.say(`autoReply: ${Global.autoReply}`)
                    break

                default:
                    await filehelper.say('Error: Invalid instruction')
                    break
            }
        }

        // 除了给filehelper和自己发之外的 所有自己发的消息，不再继续处理，到此为止
        // if (msg.self()) return

        // 匹配用户发的消息开始
        // 完全匹配模式的关键词回复配置 autoReply.json
        if (Global.autoReply) {
            // const autoReplyConfig = require(`${CONFIG_JSON_PATH}/autoReply.json`).data
            const autoReplyConfig = await Autoreply.findAll()
            for (let reply of autoReplyConfig) {
                // https://www.cnblogs.com/season-huang/p/3544873.html
                const re = new RegExp('^' + reply.keyword + '$', 'i')
                if (re.test(text)) {
                    // 用户回复的关键词 == 设定的关键词
                    // @todo 7 == Text
                    switch (reply.type) {
                        case MessageType.Text:
                            await sender.say(reply.content.data)
                            break

                        case MessageType.Contact:
                            const contact = await bot.Contact.find({ name: reply.content.data })
                            if (!contact) {
                                log.warn(`No Contact Card to response: ${reply.content.data}`)
                                return
                            }
                            const contactCard = bot.Contact.load(contact.id)
                            await sender.say(contactCard)
                            break

                        case MessageType.Audio:
                        case MessageType.Video:
                        case MessageType.Image:
                        case MessageType.Emoticon:
                        case MessageType.Attachment:
                            const { FileBox } = require('file-box')
                            let fileBox: any
                            if (reply.content.data.startsWith('http')) {
                                fileBox = FileBox.fromUrl(`${reply.content.data}`)
                            } else {
                                fileBox = FileBox.fromFile(`${reply.content.data}`)
                            }
                            await sender.say(fileBox)
                            break

                        case MessageType.Url:
                            const urlLink = new UrlLink(reply.content.data)
                            await sender.say(urlLink)
                            break

                        default:
                            log.warn(`Unknow MessageType config: ${reply.type}`)
                            break
                    }
                }
            }
        }

        // 关键词入群，按群名
        // const rooms = require(`${CONFIG_JSON_PATH}/roomAutoJoin.json`).data
        const rooms = await Autojoin.findAll()
        rooms.forEach(async (room) => {
            if (text === room.topic) {
                // 用户回复的关键词 == 群名
                const myRoom = await bot.Room.find({ topic: room.topic })
                if (!myRoom) return
                if (await myRoom.has(sender)) {
                    sender.say('You are already in the room')
                }
                await sender.say(`Will put you in ${room.topic} room!`)
                myRoom.add(sender)
            }
        })
    }

    // // save msg in db begin
    if (type !== MessageType.Unknown) {
        let content: any = text
        let save: boolean = true
        // save file first
        switch (type) {
            case MessageType.Image:
            case MessageType.Attachment: //mp3
            case MessageType.Video:
            case MessageType.Emoticon:
                const subDir = MessageType[type].toLowerCase()
                content = await saveMsgFile(msg, subDir)

                break

            case MessageType.Url:
                const jsonPayload = await xml_to_json.xmlToJson(content)
                content = {
                    title: jsonPayload.msg.appmsg.title,
                    url: jsonPayload.msg.appmsg.url,
                    description: jsonPayload.msg.appmsg.des,
                    thumbnailUrl: jsonPayload.msg.appmsg.thumburl
                }
                break
            case MessageType.Audio:
                //语音消息，不存储
                save = false
                break
            case MessageType.Contact:
            case MessageType.ChatHistory:
            case MessageType.Location:
            case MessageType.MiniProgram:
            case MessageType.Transfer:
            case MessageType.RedEnvelope:
            case MessageType.Recalled:
                save = false
                break
            default:
                break
        }
        //get content to save
        if (!save) {
            log.error(`MessageType`, `${MessageType[type]} not saved! ${content}`)
            return
        }
        // todo contactId or roomId
        MsgModel.create({
            msgId: msg.id,
            from: from ? from.id : null,
            to: room ? room.id : to ? to.id : null,
            type: type,
            content: { data: content }
        }).then(() => log.info('onMessage', `MsgModel ${MessageType[type]}: created`))
    } else {
        log.error('onMessage', `MsgModel MessageType.Unknown: ${text}`)
    }
    // // save msg in db end
}

/**
 * saveMsgFile
 */
async function saveMsgFile(msg, subDir) {
    const file = await msg.toFileBox()
    const targetDir = `./files/msg/${subDir}`
    // TODO md5 files!!!
    // todo create subDir if not exsits
    // fs.mkdirSync(targetDir, { recursive: true })
    // const now = moment().format('YYMMDDHH:mm:ss')

    const ext = file.name.split('.')[1]
    let filePath = `${targetDir}/${msg.id}`
    if (ext) {
        filePath += `.${ext}`
    }

    if (msg.type() == MessageType.Emoticon) {
        filePath += '.gif'
    }

    // await file.toFile(filePath)

    //  确保每个文件只存储一次
    //读取一个Buffer
    // var fs = require('fs')
    // var path = require('path')
    // var buffer = fs.readFileSync(path.resolve(__dirname, `../../${filePath}`))
    var buffer = await file.toBuffer(filePath)
    var fsHash = crypto.createHash('md5')
    fsHash.update(buffer)
    var md5 = fsHash.digest('hex')

    const [fileBox, created] = await FileBox.findOrCreate({
        where: { md5: md5 },
        defaults: {
            path: filePath
        }
    })
    if (created) {
        file.toFile(filePath)
        // fs.unlinkSync(filePath)
    }
    //  确保每个文件存储一次 end
    return fileBox.path
}

module.exports = onMessage
