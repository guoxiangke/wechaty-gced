import { log, Contact, Wechaty, Room } from 'wechaty'
const { FileBox } = require('file-box')
const moment = require('moment')

import { Vars as Global } from '../global-var'
const bot: Wechaty = Global.bot

import { Job } from '../model/job'
const { Subscription } = require('../model/subscription')

async function init() {
    const cron = require('node-schedule')
    // todo 每天发一个链接
    //let tasks = require(`${CONFIG_JSON_PATH}/schedule.json`).data

    let subscriptions: Array<any> = await Subscription.findAll()
    if (subscriptions.length === 0) {
        await require('../model/import/subscription')
    }

    let jobs: Array<any> = []
    //todo load新任务，当数据库改变时
    subscriptions.forEach((subscription) => {
        log.info('SCHEDULE', `taskId:${subscription.taskId} cron:${subscription.cron}`)
        jobs[subscription.id] = cron.scheduleJob(subscription.cron, () => setOrRun(subscription))
    })

    // var k = schedule.scheduleJob(cancelRule, function () {
    //     console.log('定时器取消' + moment().format())
    //     j.cancel();
    // })
}

async function setOrRun(subscription: any) {
    let job = await Job.findOne({ where: { id: subscription.jobId } })
    log.info('SCHEDULE', `${JSON.stringify(job)}`)

    let current: string = ''
    if (job.by === 'count') {
        const startDate = moment(subscription.offset, 'YYYY-M-DD')
        const daysDiff = moment().diff(startDate, 'days')
        current = String(daysDiff % job.count)
        if (job.pad && job.fill) {
            current = current.padStart(job.pad, job.fill)
        }
    }
    if (job.by === 'date') {
        current = moment().format('MMDD') //0101.mp4
    }
    const path = job.path.replace('${current}', current)

    log.info('SCHEDULE', `Current:${current} Resource:${path}`)
    // todo answer = Text 每日一句
    let answer: any
    if (job.path.startsWith('http')) {
        answer = FileBox.fromUrl(encodeURI(path))
    } else {
        answer = FileBox.fromFile(path)
    }

    subscription.to.data.forEach(async (el) => {
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
