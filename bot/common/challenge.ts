import { log, Contact, Wechaty, Room, Message } from 'wechaty'

// import { Vars as Global } from '../global-var'
// const redis: Redis = Global.redis

// ```
// 1. 发起群挑战
// 用户发送 “#群挑战#”
// 2.初始化redis KEY
// 记录群id wechaty01_gid //gid形式，以防群名改变
// wechat01_rooms_hallenge = [room1,room2]
// 记录群成员 wechaty01_gid_members = []
// 每一个成员 wechaty01_gid_uid
// 第一个机器人名字 wechaty01_ // grace365_
// 3.响应：“恭喜，开启成功！请回复 #已读 #已完成 配置关键字”
// 4.监测本群消息 wechat01_rooms_hallenge = [room1,room2]
// 5.匹配关键词
//     恭喜这是有史以来第x次打开。
//     排行榜
// 7.cronjob 每晚7点，统计整体打开情况，@提醒还未打开用户
// 9.cronjob 每周日晚8点，提醒本周打开情况
// ```

async function challenge(
    msg: Message,
    room: Room,
    text: String,
    sender: Contact,
    msgSenderAlias: String
) {
    log.warn('CHALLENGE', `msg: ${msg}`)
    log.warn('CHALLENGE', `room: ${room}`)
    log.warn('CHALLENGE', `text: ${text}`)
    log.warn('CHALLENGE', `sender: ${sender}`)
    log.warn('CHALLENGE', `msgSenderAlias: ${msgSenderAlias}`)
}
module.exports = challenge
