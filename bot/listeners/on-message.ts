import { log, Contact, Message, Wechaty, UrlLink, Room } from 'wechaty'
import { MessageType } from 'wechaty-puppet'

import { Autoreply } from '../model/autoreply'

// Global.autoReply 全局控制变量
import { Vars as Global } from '../global-var'
const bot: Wechaty = Global.bot

// import { RedisClient } from 'redis'
// const redis: RedisClient = Global.redis
import { Message as MsgModel } from '../model/message'

// 关键词聊天（非群聊）默认开启，bot回复#off给filehelper关闭
Global.autoReply = true
const CONFIG_JSON_PATH = '../config'

async function onMessage(msg: Message) {
    log.info('onMessage', `${msg}`)
    // Handle Exception
    if (msg.age() > 60) {
        log.info('onMessage', 'Message discarded because its TOO OLD(than 1 minute)')
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

    const type = msg.type()
    const filehelper = bot.Contact.load('filehelper')

    let msgSenderAlias = await sender.alias()
    // bot本身无法通过alias获取群昵称
    if (!msgSenderAlias) {
        msgSenderAlias = await sender.name()
        log.info('onMessage', `get sender by name ${msgSenderAlias}`)
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
        // todo Redis/DB + UI config!
        const forwards = require(`${CONFIG_JSON_PATH}/forward.json`).data

        forwards.forEach((forward) => {
            const destinations = forward.destinations
            forward.sources.forEach((source) => {
                if (topic === source.topic) {
                    source.senders.forEach(async (sender) => {
                        if (sender.alias === msgSenderAlias) {
                            allRooms.forEach(async (room) => {
                                if (room === hostRoom) return //不再次转发到源群
                                const forwardRoomTopic = await room.topic()
                                destinations.forEach(async (to) => {
                                    if (to.topic === forwardRoomTopic) {
                                        log.info('onMessage', `FORWOARD_TO ${room}`)
                                        await msg.forward(room)
                                    }
                                })
                            })
                        }
                    })
                }
            })
        })

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
        if (msg.self()) return
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
        const rooms = require(`${CONFIG_JSON_PATH}/roomAutoJoin.json`).data
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
        // save file first
        switch (type) {
            case MessageType.Image:
            case MessageType.Attachment: //mp3
            case MessageType.Video:
            case MessageType.Emoticon:
                const subDir = MessageType[type].toLowerCase()
                content = await saveMsgFile(msg, subDir)
                break
            case MessageType.Audio:
                log.error(`MessageType.Video //todo`, `${content}`)
                break

            case MessageType.Url:
                const xml_to_json = require('../utils/xml-to-json')
                const jsonPayload = await xml_to_json.xmlToJson(content)
                content = {
                    title: jsonPayload.msg.appmsg.title,
                    url: jsonPayload.msg.appmsg.url,
                    description: jsonPayload.msg.appmsg.des,
                    thumbnailUrl: jsonPayload.msg.appmsg.thumburl
                }
                break
            case MessageType.Contact:
            case MessageType.ChatHistory:
            case MessageType.Location:
            case MessageType.MiniProgram:
            case MessageType.Transfer:
            case MessageType.RedEnvelope:
            case MessageType.Recalled:
                log.warn(`MessageType saved`, `MessageType[type]`)
                break
            default:
                log.error(`MessageType`, `${content}`)
                break
        }
        //get content to save
        MsgModel.create({
            msgId: msg.id,
            from: from ? from.id : null,
            to: room ? room.id : to ? to.id : null,
            type: type,
            content: { data: content }
        }).then(() => log.info('MsgModel', 'created'))
    } else {
        log.error('MsgModel', `MessageType.Unknown:${text}`)
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
    file.toFile(filePath)
    return filePath
}

module.exports = onMessage
