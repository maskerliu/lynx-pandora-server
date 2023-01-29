import { Repository } from 'lynx-express-mvc'
import { DB_DIR } from '../common/env.const'
import { User } from '../models'
import BaseRepo from './base.repo'

@Repository(DB_DIR, 'vip-item.db')
export class VIPItemRepo extends BaseRepo<User.VIPItem>{
  async init() {
    try {
      await this.pouchdb.createIndex({ index: { fields: ['status', 'seq'], ddoc: 'idx-seq' } })
    } catch (err) {
      console.error('initDB', err)
    }
  }

  async importData(items: Array<User.VIPItem>) {
    await this.pouchdb.bulkDocs(items)
  }

  async getAllVaildItems() {
    let req: PouchDB.Find.FindRequest<any> = {
      selector: {
        status: User.VIPStatus.On,
        seq: { $gt: -1 }
      },
      sort: [{ 'status': 'asc' }, { 'seq': 'asc' }],
      use_index: 'idx-seq'
    }
    let resp = await this.pouchdb.find(req)
    return resp.docs.map(it => {
      delete it._rev
      return it as User.VIPItem
    })
  }
}


@Repository(DB_DIR, 'vip-order.db')
export class VIPOrderRepo extends BaseRepo<User.VIPOrder> {
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
        expired: { $gt: time }
      }
    }
    let resp = await this.find(req)
    if (resp.length > 0) return resp[0] as User.VIPOrder
    else return null
  }
}

