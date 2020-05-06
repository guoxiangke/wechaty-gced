import { init as initContacts } from './contact'
import { init as initRooms } from './room'
import { init as initSchedules } from './schedule'

/**
 * 存储/更新 所有联系人和聊天室 from wxbot
 * 更新/初始化 计划任务 from db
 */
;(() => {
    initContacts()
    initRooms()
    initSchedules()
})()
