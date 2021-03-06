# groupChallengeEveryDay

[![Powered by Wechaty](https://img.shields.io/badge/Powered%20By-Wechaty-green.svg)](https://github.com/chatie/wechaty)
[![Wechaty开源激励计划](https://img.shields.io/badge/Wechaty-开源激励计划-green.svg)](https://github.com/juzibot/Welcome/wiki/Everything-about-Wechaty)

## 开发背景

某微信群中有人每天发布系列性的学习文章（专辑以文本形式）。同时这些内容又对另外一些群适用，但是鉴于群的社交特性，不便把用户都放到一个群里。而且 bot 不是群主。bot 想做个雷锋，转发一下。

bot 有几个垂直领域的群，都不是群主，但是每个群每天都在打开学习（可以持续 365 天的那种），但是微信新出的群打卡 1.列表长 2.书写麻烦，于是乎想做一个群打卡机器人，在使用特定关键词打卡后，进行友好回应提示，并给出激励提醒。（@you，恭喜您完成今日 xx 学习挑战，您已坚持 count 天，✊ 加油啊！）

https://wechaty.js.org/v/zh/api
https://github.com/wechaty/wechaty-puppet-padplus

![2020-04-22_14-47-57](https://i.loli.net/2020/04/22/GbYLMgv39A7JdZf.jpg)

## 功能

-   群转发
    -   [x] 万群群发: 使用场景，新年问候，群发给所有群。
        -   [x] 新建或配置一个群（主人群 0421），本群里的所有消息将转发给（除本群外）的所有群！
    -   [x] 经典转发： 指定 A 群里的任意成员 b 的消息，转发到其他指定 C、D、E..群里
        -   [x] 转发处理，转发源分 2 重情况：room 或 contact 即转发来自群的消息或转发来自某个联系人的消息
        -   [x] 如果是来自群的消息，可以配置只转发群内的某几个人的消息，或者全部转发（senders 为空）
    -   [x] 数据库配置
    -   [ ] UI
        -   [ ] https://github.com/bezkoder/vue-typescript-crud
        -   [ ] https://bezkoder.com/vue-typescript-crud/
    -   [ ] 指定公众号消息的第 X 条消息转发到指定群里（不可能实现 🙅‍♂️）
-   定时发送/群/联系人
    -   [x] 自定义配置
        -   [x] 配置文件 ./bot/config/schedule.json
        -   [ ] schedule config reload!
    -   [x] 定时发送本地 mp3
    -   [x] 定时发送本地 mp4 需要安装 ffmpeg，见 Dockerfile
    -   [x] 定时发送规则
        -   [x] 按文件个数 count (如循环发送 001.mp3~150.mp3)
        -   [x] 按日期 date (如循环发送 0101.mp4~1231.mp4)
-   群挑战 GCED
    -   [ ] 进群发送欢迎语/群公告
    -   [ ] 任意成员发送指令【GCED】开启本群挑战模式，发送欢迎语与挑战说明
        -   [ ] 恭喜，您已成功为本群发起【xx 挑战 365】打卡学习任务。@ALL 如同意参与挑战，请 24 小时内回复指令【我接受】即可在每日排行榜看到你漂亮的身影！
    -   [ ] 用户每日回复指令（模糊识别关键词）打卡
    -   [ ] 每日凌晨 `5:00` 统计打卡情况并进行公布
    -   [ ] 打卡排行榜
-   管理员功能
    -   [ ] 查看当天未签到用户 (当天 0 点前)
    -   [ ] 查看三天未签到用户
    -   [ ] 设置管理员
    -   [ ] 设置黑名单（移除放弃挑战的成员）
    -   [ ] 所有指令可后台配置/正则匹配
-   关键词聊天（非群聊）

    -   [x] 默认开启，bot 回复#off 给 filehelper 关闭
    -   [x] 回复 群名称 拉你入群，默认开启，配置文件 ./bot/roomAutoJoin.json
    -   [x] 自定义关键词
        -   [x] 配置文件 ./bot/config/autoReply.json
    -   [x] 自定义关键词回复类型
        -   [x] Text
        -   [x] Url
        -   [x] Contact
        -   [x] Attachment(含 Audio、Video、Image、Emoticon)

-   Other

    -   [x] 群名防篡改（仅限群主是 bot 的群)
    -   [x] bot 收到群邀请，自动入群
    -   [x] 消息存储到 DB
    -   [x] files 存储到 files/msg/ 并 md5 去重
    -   [ ](队列)[https://github.com/huan/rx-queue]
    -   [ ] 多种挑战类型供发起挑战，为避免混乱，一个群只能开一种
        -   [ ] GTED-读经
        -   [ ] GTED-诗篇
        -   [ ] GTED-祷告 0101.mp3 ~ 1231.mp3
        -   [ ] GTEP-视频 0101.mp4 ~ 1231.mp4

## 配置

```
# 设置token
copy .env.example .env
vi .env
    WECHATY_PUPPET_PADPLUS_TOKEN=puppet_padplus_13f028f0cba*******

# 设置转发规则
copy ./bot/forward.json.example ./bot/forward.json
vi forward.json


# 配置可加入的群
copy ./bot/roomAutoJoin.json.example ./bot/roomAutoJoin.json
vi ./bot/roomAutoJoin.json
```

## 开发

```
npm install
npm start
```

## 上线

```
docker-compose up -d
```

## 问题

FileBox.fromUrl(https://1.1.1.1/1.mp3) 是一个链接地址！

FileBox.fromUrl(https://1.1.1.1/2.mp4) 是一个 mp4 文件

FileBox.fromUrl(https://1.1.1.1/3.jpg) 是一个图片

## todo

-   https://github.com/RobinBuschmann/sequelize-typescript
-   https://github.com/douglas-treadwell/sequelize-cli-typescript

```


1. 发起群挑战
用户发送 “@本群群名 #群挑战”
2.初始化redis KEY
记录群id wechaty01_gid //gid形式，以防群名改变
wechat01_rooms_hallenge = [room1,room2]
记录群成员 wechaty01_gid_members = []
每一个成员 wechaty01_gid_uid
第一个机器人名字 wechaty01_ // grace365_
3.响应：“恭喜，开启成功！请回复 #已读 #已完成 配置关键字”
4.监测本群消息 wechat01_rooms_hallenge = [room1,room2]
5.匹配关键词
    恭喜这是有史以来第x次打开。
    排行榜
7.cronjob 每晚7点，统计整体打开情况，@提醒还未打开用户
9.cronjob 每周日晚8点，提醒本周打开情况
```
