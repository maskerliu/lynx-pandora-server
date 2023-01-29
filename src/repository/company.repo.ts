import { Repository } from 'lynx-express-mvc'
import { DB_DIR } from '../common/env.const'
import { Organization } from '../models'
import { IOT } from '../models/iot.model'
import BaseRepo from './base.repo'

@Repository(DB_DIR, 'company.db')
export class CompanyRepo extends BaseRepo<Organization.Company> {
  async init() { }
}

@Repository(DB_DIR, 'role.db')
export class RoleRepo extends BaseRepo<Organization.Role> {
  async init() {
    try {
      await this.pouchdb.createIndex({ index: { fields: ['cid'], ddoc: 'idx-cid' } })
    } catch (err) {
      console.error('initDB', err)
    }
  }
}

@Repository(DB_DIR, 'operator.db')
export class OperatorRepo extends BaseRepo<Organization.Operator> {

  async init() {
    try {
      await this.pouchdb.createIndex({ index: { fields: ['cid'], ddoc: 'idx-cid' } })
      await this.pouchdb.createIndex({ index: { fields: ['uid'], ddoc: 'idx-uid' } })
      await this.pouchdb.createIndex({ index: { fields: ['cid', 'timestamp'], ddoc: 'idx-timestamp' } })
    } catch (err) {
      console.error('initDB', err)
    }
  }

  async pagedGet(cid: string, page: number, pageSize: number) {
    let request: PouchDB.Find.FindRequest<any> = {
      selector: {
        cid,
        timestamp: { $lt: new Date().getTime() }
      },
      sort: [{ 'cid': 'desc', 'timestamp': 'desc' }],
      limit: pageSize,
      skip: page * pageSize,
      use_index: 'idx-timestamp'
    }

    let result = await this.find(request)
    result.forEach(it => { delete it._rev })
    return result
  }

}