import { Repository } from 'lynx-express-mvc'
import { DB_DIR } from '../common/env.const'
import { Chatroom } from '../models'
import BaseRepo from './base.repo'


@Repository(DB_DIR, 'chatroom.db')
export class ChatRoomRepo extends BaseRepo<Chatroom.Room> {

  async init() {
    try {
      await this.pouchdb.createIndex({ index: { fields: ['uid'], ddoc: 'idx-uid' } })
    } catch (err) {
      console.error('initDB', err)
    }
  }
}


@Repository(DB_DIR, 'chatroom-gift.db')
export class GiftRepo extends BaseRepo<Chatroom.Gift> {

  async init() {
    try {
      await this.pouchdb.createIndex({ index: { fields: ['uid'], ddoc: 'idx-uid' } })
    } catch (err) {
      console.error('initDB', err)
    }
  }
}