import { Repository } from 'lynx-express-mvc'
import { DB_DIR } from '../common/env.const'
import { IM } from '../models/im.model'
import BaseRepo from './base.repo'

@Repository(DB_DIR, 'im-emoji.db')
export class IMEmojiRepo extends BaseRepo<IM.IMEmoji> {
  async init() {
    try {
      await this.pouchdb.createIndex({ index: { fields: ['uid', 'timestamp'], ddoc: 'idx-uid' } })
    } catch (err) {
      console.error('initDB', err)
    }
  }

  async getMyEmojis(uid: string) {
    let req: PouchDB.Find.FindRequest<any> = {
      selector: { uid, timestamp: { $lt: new Date().getTime() } },
      sort: [{ 'uid': 'desc' }, { 'timestamp': 'desc' }],
      use_index: 'idx-uid'
    }
    return await this.find(req)
  }

  async findSameEmoji(uid: string, emoji: IM.IMEmoji) {
    let req: PouchDB.Find.FindRequest<any> = {
      selector: { uid, snap: emoji.snap, gif: emoji.gif }
    }
    let result = await this.find(req)
    return result.length > 0
  }

  async bulkEmojis(ids: string[]) {
    let req: PouchDB.Find.FindRequest<any> = {
      selector: { _id: { $in: ids } }
    }
    return await this.find(req)
  }
}

@Repository(DB_DIR, 'im-session.db')
export class SessionRepo extends BaseRepo<IM.Session> {

  async init() {
    try {
      await this.pouchdb.createIndex({ index: { fields: ['sid'], ddoc: 'idx-sid' } })
      await this.pouchdb.createIndex({ index: { fields: ['uid'], ddoc: 'idx-uid' } })
    } catch (err) {
      console.error('initDB', err)
    }
  }

  public async bulkGet(sids: Array<string>) {
    let request: PouchDB.Find.FindRequest<any> = {
      selector: {
        sid: { $in: sids }
      }
    }
    return await this.find(request)
  }
}

@Repository(DB_DIR, 'im-offline-messages.db')
export class OfflineMessageRepo extends BaseRepo<IM.Message> {

  async init() {
    try {
      await this.pouchdb.createIndex({ index: { fields: ['to'], ddoc: 'idx-to' } })
    } catch (err) {
      console.error('initDB', err)
    }
  }

  async bulkGet(uid: string) {
    let opt: PouchDB.Find.FindRequest<any> = {
      selector: {
        to: uid
      },
    }
    let resp = await this.find(opt)

    let docs = resp.map(it => {
      return { _id: it._id, _rev: it._rev, _deleted: true }
    })

    await this.pouchdb.bulkDocs(docs)

    return resp
  }
}


@Repository(DB_DIR, 'im-redpacket-record.db')
export class RedPacketRepo extends BaseRepo<IM.RedPacket>{
  async init() {
    try {
      await this.pouchdb.createIndex({ index: { fields: ['orderId', 'status', 'updateTime'], ddoc: 'idx-order' } })
    } catch (err) {
      console.error('initDB', err)
    }
  }

  async getUnclaimedPackets(orderId: string) {
    let req: PouchDB.Find.FindRequest<any> = {
      selector: {
        orderId,
        status: IM.RedPacketStatus.Unclaimed
      }
    }

    return await this.find(req)
  }

  async getRedPackets(orderId: string, status: IM.RedPacketStatus) {
    let req: PouchDB.Find.FindRequest<any> = {
      selector: { orderId, status, updateTime: { $lt: new Date().getTime() } },
      sort: [{ 'orderId': 'desc' }, { 'status': 'desc' }, { 'updateTime': 'desc' }],
      use_index: 'idx-order'
    }

    return await this.find(req)
  }
}

@Repository(DB_DIR, 'im-redpacket-order.db')
export class RedPacketOrderRepo extends BaseRepo<IM.RedPacketOrder> {
  async init() {
    try {
      await this.pouchdb.createIndex({ index: { fields: ['uid'], ddoc: 'idx-uid' } })
    } catch (err) {
      console.error('initDB', err)
    }
  }
}