import { Room, Wechaty } from 'wechaty'
import { LevelUP } from 'levelup'
import { RedisClient } from 'redis'

export class Vars {
    public declare static bot: Wechaty
    public declare static allRooms: Array<Room>

    public declare static autoReply: boolean
    public declare static aiReply: boolean

    public declare static rocksdb: LevelUP
    public declare static redis: RedisClient
    public declare static redisSync: any
}
