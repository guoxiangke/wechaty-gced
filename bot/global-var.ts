import { Room, Wechaty } from 'wechaty'
import { LevelUP } from 'levelup'

export class Vars {
    public declare static autoReply: boolean
    public declare static aiReply: boolean

    public declare static allRooms: Array<Room>
    public declare static bot: Wechaty
    public declare static rocksdb: LevelUP
}
