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
import { Type as ContactModelType } from '../model/contact'
import { findOrCreate as ContactModelFindOrCreate } from '../model/contactfindOrCreate'

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
        // 万群群发begin
        // 主人群的每条消息/bot发的消息，都群发给bot的所有群！
        const ownerGroupName: string = process.env.FORWOARD_ALL || 'FORWOARD_ALL'
        if (topic === ownerGroupName) {
            log.info('onMessage', `FORWOARD_ALL: ${allRooms}`)
            allRooms.forEach((room) => {
                if (room === hostRoom) return //不再次转发到源群
                //返回 不做DB和files处理了！
                msg.forward(room) //return 不用返回，因为转发到群的信息不做二次onmessage event
            })
        }
        // 万群群发end

        // forward begin for room
        // 经典转发 todo UI config!
        // const forwards = require(`${CONFIG_JSON_PATH}/forward.json`).data
        const forwards = await ForwardModel.findAll({ where: { fromType: ForwardType.Room } })
        for (let forward of forwards) {
            const destinations = forward.destinations.data
            //转发群消息
            if (topic === forward.fromName) {
                //如果是来自于 配置要群发的群
                if (
                    //如果 发送者 在配置中 or
                    forward.senders.data.includes(msgSenderAlias) ||
                    // 如果是空，则代表所有人的消息都群发到 destinations
                    forward.senders.data.length == 0
                ) {
                    forwardTo(destinations, msg)
                }
            }
        }
        // forward end for room

        //([有人@我])
        if (await msg.mentionSelf()) {
            // 入群管理begin
            const owner = room.owner()
            //必须是群主@bot
            if (owner === sender) {
                if (text.indexOf('入群管理') != -1) {
                    // 加入数据库/并内存
                    Global.autoJoinRooms[topic] = room
                    await Autojoin.findOrCreate({
                        where: {
                            topic: topic
                        }
                    })
                    room.say(
                        `已为本群开通本功能，新用户可以回复本群名给本bot即可自动入群，请关闭群邀请确认功能`
                    )
                }
            }
            // 入群管理end
        }

        // #群挑战#
        if (false) {
            const challenge = require('./common/challenge')
            challenge(msg, room, text, sender, msgSenderAlias)
        }
    } else {
        let replied: boolean = false //已处理
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
                            replied = true
                            break

                        case MessageType.Contact:
                            const contact = await bot.Contact.find({ name: reply.content.data })
                            if (!contact) {
                                log.warn(`No Contact Card to response: ${reply.content.data}`)
                                return
                            }
                            const contactCard = bot.Contact.load(contact.id)
                            await sender.say(contactCard)
                            replied = true
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
                            replied = true
                            break

                        case MessageType.Url:
                            const urlLink = new UrlLink(reply.content.data)
                            await sender.say(urlLink)
                            replied = true
                            break

                        default:
                            log.warn(`Unknow MessageType config: ${reply.type}`)
                            break
                    }
                }
            }
        }

        // 关键词入群，按群名
        const rooms = Global.autoJoinRooms
        const topics = Object.keys(rooms)
        if (topics.includes(text)) {
            replied = true
            const myRoom = rooms[text]
            if (await myRoom.has(sender)) {
                sender.say('You are already in the room')
            } else {
                await sender.say(`Will put you in ${text} room!`)
                myRoom.add(sender)
            }
        }

        // forward begin 转发个人配置
        const forwards = await ForwardModel.findAll({ where: { fromType: ForwardType.Contact } })

        for (let forward of forwards) {
            const destinations = forward.destinations.data
            if (msgSenderAlias === forward.fromName) {
                forwardTo(destinations, msg)
            }
        }
        // forward end
        if (!replied) {
            await sender.say(await getDefaultReply())
        }
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
            case MessageType.MiniProgram: //todo  主动发送小程序！
            case MessageType.Audio:
                //语音消息，不存储
                save = false
                break
            case MessageType.Contact:
            case MessageType.ChatHistory:
            case MessageType.Location:
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
            log.info(`MessageType`, `${MessageType[type]} not saved! ${content}`)
            return
        }
        // todo contactId or roomId
        let contactModel = await ContactModelFindOrCreate(
            sender,
            room ? ContactModelType.RoomMemeber : ContactModelType.Contact
        )

        // let to = room ? room.id : to ? to.id : null
        let to: any = null
        if (room) {
            to = room.id
        } else {
            to = msg.to()
            to = to.id
        }

        MsgModel.create({
            msgId: msg.id,
            fromId: contactModel.id,
            to: to, // @room or wx_id
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
async function saveMsgFile(msg, subDir: string) {
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

/**
 *
 * @param destinations: Array<any>
 * @param msg: Message
    转发处理，转发源分2重情况：room或contact 即转发来自群的消息或转发来自某个联系人的消息
    如果是来自群的消息，可以配置只转发群内的某几个人的消息，或者全部转发（senders为空）

    已支持 小程序转发
    https://github.com/wechaty/wechaty-puppet-padplus/issues/226
 */
function forwardTo(destinations: Array<any>, msg: Message) {
    const text = msg.text()
    let type: number | any = msg.type()
    destinations.forEach(async (to) => {
        let unknownMsg: any

        if (type == MessageType.Unknown) {
            // Music support in receive and forward
            // https://github.com/wechaty/wechaty-puppet-padplus/issues/243
            const jsonPayload = await xml_to_json.xmlToJson(text)
            if (jsonPayload.msg.appmsg.type == 3) {
                // type = 'MusicLink' // 15 Music ？
                unknownMsg = new UrlLink({
                    description: jsonPayload.msg.appmsg.des + ' 点击[浮窗]后台播放',
                    thumbnailUrl: 'https://res.wx.qq.com/a/wx_fed/assets/res/OTE0YTAw.png',
                    title: jsonPayload.msg.appmsg.title,
                    url: jsonPayload.msg.appmsg.url
                })
            }
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

async function getDefaultReply() {
    const autoReplyConfig = await Autoreply.findAll()
    let defaultReply: string =
        '亲，暂无法解析本次请求[抱拳]\r请回复以下关键词获取资源\r===============\r'
    for (let reply of autoReplyConfig) {
        // https://www.cnblogs.com/season-huang/p/3544873.html
        defaultReply += `【${reply.keyword}】\r`
    }

    const rooms = Global.autoJoinRooms
    let defaultRooms: string = ''
    for (var topic in rooms) {
        defaultRooms += `【${topic}】\r`
    }
    if (defaultRooms) {
        defaultReply += `\r回复群名，自动入群\r===============\r${defaultRooms}`
    }
    return defaultReply
}
module.exports = onMessage
