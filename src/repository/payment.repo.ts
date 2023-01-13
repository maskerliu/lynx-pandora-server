import { Repository } from 'lynx-express-mvc'
import { DB_DIR } from '../common/env.const'
import { Chatroom } from '../models'
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

  async createWallet(wallet: Payment.Wallet) {
    let resp = await this.pouchdb.post(wallet)
    if (resp.ok) return resp.id
    else throw 'fail to create wallet'
  }

  async updateWallet(wallet: Payment.Wallet) {
    let resp = await this.pouchdb.put(wallet)
    if (resp.ok) return resp.id
    else throw 'fail to update wallet'
  }

  async bulkGet(uids: Array<string>) {
    let req: PouchDB.Find.FindRequest<any> = {
      selector: {
        uid: { $in: uids }
      }
    }
    let resp = await this.pouchdb.find(req)

    return resp.docs.map(it => {
      return it as Payment.Wallet
    })
  }

  async bulkUpdate(docs: Array<Payment.Wallet>) {
    let resp = await this.pouchdb.bulkDocs(docs)
    // todo handle error
    return 'success'
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

  async saveRecord(record: Payment.PayRecord) {
    let resp = await this.pouchdb.post(record)
    if (resp.ok) return resp.id
    else throw 'fail to add pay record'
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

  async addRecords(records: Array<Payment.PurseRecord>) {
    return await this.pouchdb.bulkDocs(records)
  }

  async getPagedRecords(uid: string, page: number, pageSize: number) {
    let req: PouchDB.Find.FindRequest<any> = {
      selector: {
        uid,
        timestamp: { $lt: new Date().getTime() }
      },
      skip: page * pageSize,
      sort: [{ 'uid': 'desc' }, { 'timestamp': 'desc' }],
      use_index: 'idx-uid'
    }

    let resp = await this.pouchdb.find(req)
    return resp.docs.map(it => {
      delete it._rev
      return it as Payment.PurseRecord
    })
  }
}
