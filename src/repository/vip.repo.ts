import { Repository } from 'lynx-express-mvc'
import { DB_DIR } from '../common/env.const'
import { VIP } from '../models'
import { User } from '../models/user.model'
import BaseRepo from './base.repo'

@Repository(DB_DIR, 'vip-item.db')
export class VIPItemRepo extends BaseRepo<VIP.VIPItem>{
  async init() {
    try {
      await this.pouchdb.createIndex({ index: { fields: ['status', 'seq'], ddoc: 'idx-seq' } })
    } catch (err) {
      console.error('initDB', err)
    }
  }

  async importData(items: Array<VIP.VIPItem>) {
    await this.pouchdb.bulkDocs(items)
  }

  async getAllVaildItems() {
    let req: PouchDB.Find.FindRequest<any> = {
      selector: {
        status: VIP.VIPStatus.On,
        seq: { $gt: -1 }
      },
      sort: [{ 'status': 'asc' }, { 'seq': 'asc' }],
      use_index: 'idx-seq'
    }
    let resp = await this.pouchdb.find(req)
    return resp.docs.map(it => {
      delete it._rev
      return it as VIP.VIPItem
    })
  }
}


@Repository(DB_DIR, 'vip-order.db')
export class VIPOrderRepo extends BaseRepo<VIP.VIPOrder> {
  async init() {
    try {
      await this.pouchdb.createIndex({ index: { fields: ['uid'], ddoc: 'idx-uid' } })
    } catch (err) {
      console.error('initDB', err)
    }
  }

  async getUserVaildOrder(uid: string) {
    let time = new Date().getTime()
    let req: PouchDB.Find.FindRequest<any> = {
      selector: {
        uid,
        timestamp: { $lt: time },
        expired: { $gt: time }
      }
    }

    let resp = await this.pouchdb.find(req)
    if (resp.docs.length > 0) return resp.docs[0] as VIP.VIPOrder
    else return null
  }

  async addOrder(order: VIP.VIPOrder) {
    let resp = await this.pouchdb.post(order)
    if (resp.ok) return resp.id
    else throw 'fail to add vip order'
  }
}

