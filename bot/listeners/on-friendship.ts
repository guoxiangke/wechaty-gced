import { log, Friendship } from 'wechaty'

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
            //自动通过好友请求？ or  关键词通过
            if (friendship.hello() === 'ding') {
                await friendship.accept()
                // 更新 contacts 表
            }
            break
        case Friendship.Type.Confirm:
            log.info('friend ship confirmed with ' + friendship.contact().name())
            break
    }

    log.info('received `friend` event from ' + friendship.contact().name())
}
module.exports = onFriendship
