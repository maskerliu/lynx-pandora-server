import { Repository } from 'lynx-express-mvc'
import { DB_DIR } from '../common/env.const'
import { User } from '../models/user.model'
import BaseRepo from './base.repo'

@Repository(DB_DIR, 'user-account.db')
export class AccountRepo extends BaseRepo<User.Account> {
  async init() {
    try {
      await this.pouchdb.createIndex({ index: { fields: ['phone'], ddoc: 'idx-phone' } })
      await this.pouchdb.createIndex({ index: { fields: ['token'], ddoc: 'idx-token' } })
    } catch (err) {
      console.error('initDB', err)
    }
  }

  async createAccount(account: User.Account) {
    let resp = await this.pouchdb.post(account)
    if (resp.ok) return resp.id
    else throw 'fail to create account'
  }

  async updateAccount(account: User.Account) {
    let resp = await this.pouchdb.put(account)
    if (resp.ok) return resp.id
    else throw 'fail to update account'
  }
}

@Repository(DB_DIR, 'user-profile.db')
export class UserInfoRepo extends BaseRepo<User.Profile> {
  async init() {
    try {
      await this.pouchdb.createIndex({ index: { fields: ['uid'], ddoc: 'idx-uid' } })
    } catch (err) {
      console.error('initDB', err)
    }
  }

  async bulkGet(uids: Array<string>) {
    let request: PouchDB.Find.FindRequest<any> = {
      selector: {
        uid: { $in: uids }
      }
    }
    let resp = await this.pouchdb.find(request)

    return resp.docs.map(it => {
      delete it._rev
      return it as User.Profile
    })
  }
}

@Repository(DB_DIR, 'user-grade.db')
export class GradeRepo extends BaseRepo<User.GradeItem> {
  async init() {
    try {
      await this.pouchdb.createIndex({ index: { fields: ['uid'], ddoc: 'idx-uid' } })
    } catch (err) {
      console.error('initDB', err)
    }
  }

  async importData(grades: Array<User.GradeItem>) {
    await this.pouchdb.bulkDocs(grades)
  }
}

@Repository(DB_DIR, 'grade-score-record.db')
export class GradeScoreRecordRepo extends BaseRepo<User.GradeScoreRecord> {
  async init() {
    try {
      await this.pouchdb.createIndex({ index: { fields: ['uid'], ddoc: 'idx-uid' } })
    } catch (err) {
      console.error('initDB', err)
    }
  }
}