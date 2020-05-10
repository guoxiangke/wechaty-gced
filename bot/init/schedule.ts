import { log, Contact, Wechaty, Room } from 'wechaty'
const { FileBox } = require('file-box')
const moment = require('moment')

import { Vars as Global } from '../global-var'
const bot: Wechaty = Global.bot

const { Schedule } = require('../model/schedule')

async function init() {
    const cron = require('node-schedule')
    // todo 每天发一个链接
    //let tasks = require(`${CONFIG_JSON_PATH}/schedule.json`).data
    let tasks: Array<any> = await Schedule.findAll()
    if (tasks.length === 0) {
        await require('../model/import/schedule')
    }

    let jobs: Array<any> = []
    //todo load新任务，当数据库改变时
    tasks.forEach((task) => {
        log.info('SCHEDULE', `${task.id}:${task.cron}:${task.path}`)
        jobs[task.id] = cron.scheduleJob(task.cron, () => setOrRun(task))
    })

    // var k = schedule.scheduleJob(cancelRule, function () {
    //     console.log('定时器取消' + moment().format())
    //     j.cancel();
    // })
}

async function setOrRun(task: any) {
    const rule = task.current.data

    let current: String = ''
    if (task.by === 'count') {
        const startDate = moment(rule.from, 'YYYY-M-DD')
        const daysDiff = moment().diff(startDate, 'days')
        current = String(daysDiff % rule.count)
        if (rule.hasOwnProperty('pad')) {
            current = current.padStart(rule.pad.maxLength, rule.pad.fillString)
        }
    }
    if (task.by === 'date') {
        current = moment().format('MMDD') //0101.mp4
    }
    const path = task.path.replace('${current}', current)

    // todo answer = Text 每日一句
    let answer: any
    if (task.path.startsWith('http')) {
        answer = FileBox.fromUrl(encodeURI(path))
    } else {
        answer = FileBox.fromFile(path)
    }

    log.info('SCHEDULE', `Current:${current} Resource:${path}`)

    task.to.data.forEach(async (el) => {
        let receiver: Room | Contact | null = null
        if (el.type === 'room') {
            // get the room by topic
            receiver = await bot.Room.find({ topic: `${el.value}` })
        } else if (el.type === 'name') {
            receiver = await bot.Contact.find({ name: `${el.value}` })
        } else if (el.type === 'alias') {
            receiver = await bot.Contact.find({ alias: `${el.value}` })
        }
        if (!receiver) {
            log.error('SCHEDULE', `Can not find ${el.type}:${el.value} to send!`)
            return
        }

        log.info('SCHEDULE', `Sent to: ${receiver}`)

        return receiver.say(answer)
    })
}

// module.exports = init
// declares 'init' locally, but it is not exported.

export { init }
