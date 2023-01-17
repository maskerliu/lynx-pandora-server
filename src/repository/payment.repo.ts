import { Repository } from 'lynx-express-mvc'
import { DB_DIR } from '../common/env.const'
import { Payment } from '../models/payment.model'
import BaseRepo from './base.repo'


@Repository(DB_DIR, 'payment-wallet.db')
export class WalletRepo extends BaseRepo<Payment.Wallet>{
  async init() {
    try {
      await this.pouchdb.createIndex({ index: { fields: ['uid'], ddoc: 'idx-uid' } })
    } catch (err) {
      console.error('initDB', err)
    }
  }

  async bulkGet(uids: Array<string>) {
    let req: PouchDB.Find.FindRequest<any> = {
      selector: {
        uid: { $in: uids }
      }
    }
    return await this.find(req)
  }
}

@Repository(DB_DIR, 'payment-pay-record.db')
export class PayRecordRepo extends BaseRepo<Payment.PayRecord> {

  async init() {
    try {
      await this.pouchdb.createIndex({ index: { fields: ['uid'], ddoc: 'idx-uid' } })
    } catch (err) {
      console.error('initDB', err)
    }
  }
}

@Repository(DB_DIR, 'payment-purse-record.db')
export class PurseRecordRepo extends BaseRepo<Payment.PurseRecord>{
  async init() {
    try {
      await this.pouchdb.createIndex({ index: { fields: ['uid', 'timestamp'], ddoc: 'idx-uid' } })
    } catch (err) {
      console.error('initDB', err)
    }
  }

  async pagedGet(uid: string, page: number, pageSize: number) {
    let req: PouchDB.Find.FindRequest<any> = {
      selector: {
        uid,
        timestamp: { $lt: new Date().getTime() }
      },
      skip: page * pageSize,
      sort: [{ 'uid': 'desc' }, { 'timestamp': 'desc' }],
      use_index: 'idx-uid'
    }

    return await this.find(req)
  }
}
