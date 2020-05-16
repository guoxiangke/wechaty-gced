import { log } from 'wechaty'

import { Vars as Global } from '../global-var'
import { saveRoomToDatabase } from '../helper/room'

/**
 * 把群主、群成员、群关系 存储/更新到数据库中
 * contacts     memember
 */

async function init() {
    for (const room of Global.allRooms) {
        await saveRoomToDatabase(room)
        log.info(`Roominited`, `${room}`)
    }
}

export { init }
