import { Repository } from 'lynx-express-mvc'
import { DB_DIR } from '../common/env.const'
import { User } from '../models/user.model'
import BaseRepo from './base.repo'

@Repository(DB_DIR, 'account.db')
export class AccountRepo extends BaseRepo<User.Account> {
  async init() {
    try {
      await this.pouchdb.createIndex({ index: { fields: ['phone'], ddoc: 'idx-phone' } })
      await this.pouchdb.createIndex({ index: { fields: ['token'], ddoc: 'idx-token' } })
    } catch (err) {
      console.error('initDB', err)
    }
  }

}

@Repository(DB_DIR, 'user-info.db')
export class UserInfoRepo extends BaseRepo<User.Profile> {
  async init() {
    try {
      await this.pouchdb.createIndex({ index: { fields: ['uid'], ddoc: 'idx-uid' } })
    } catch (err) {
      console.error('initDB', err)
    }
  }

  async bulkUsers(uids: Array<string>) {

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