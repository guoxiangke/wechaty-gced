import { log, Friendship, Wechaty } from 'wechaty'
import { Type } from '../model/contact'
import { findOrCreate } from '../model/contactfindOrCreate'
import { Vars as Global } from '../global-var'
const bot: Wechaty = Global.bot
/*
 * Send, receive friend request, and friend confirmation events.
 *
 * 1. send request
 * 2. receive request(in friend event)
 * 3. confirmation friendship(friend event)
 * @see https://github.com/wechaty/wechaty/blob/1523c5e02be46ebe2cc172a744b2fbe53351540e/examples/friend-bot.ts
 */

async function onFriendship(friendship: Friendship) {
    // const fileHelper = Contact.load('filehelper')
    // await fileHelper.say(logMsg)

    switch (friendship.type()) {
        case Friendship.Type.Receive:
            log.info('onFriendshipReceive', `${friendship.contact().name()}: ${friendship.hello()}`)
            // Todo  关键词通过
            // if (friendship.hello() === 'ding') {
            let msg = friendship.hello()
            //以下3种情况不通过！// 1.不填写好友申请文字
            msg.replace('我是', '') //2. 直接用昵称 我是天空蔚蓝
            msg.replace('群聊', '') //3. 直接通过群 我是群聊“xxx”的天空蔚蓝 todo
            if (msg.length > 0 && msg !== friendship.contact().name()) {
                await friendship.accept()
                const name = bot.userSelf().name()
                const res = `您好，我是${name}\r\n欢迎和我做朋友[微笑]\r\n请回复编号获取资源或入群[抱拳]`
                friendship.contact().say(res)
            }
            break
        case Friendship.Type.Confirm:
            log.info('onFriendshipConfirm' + friendship.contact().name())
            // 更新 contacts 表
            findOrCreate(friendship.contact(), Type.Contact)
            break
    }
}
module.exports = onFriendship
