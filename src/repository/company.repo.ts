import { Repository } from 'lynx-express-mvc'
import { DB_DIR } from '../common/env.const'
import { IOT } from '../models/iot.model'
import BaseRepo from './base.repo'

@Repository(DB_DIR, 'company.db')
export class CompanyRepo extends BaseRepo<IOT.Company> {
  async init() { }
}

@Repository(DB_DIR, 'role.db')
export class RoleRepo extends BaseRepo<IOT.Role> {
  async init() {
    try {
      await this.pouchdb.createIndex({ index: { fields: ['cid'], ddoc: 'idx-cid' } })
    } catch (err) {
      console.error('initDB', err)
    }
  }
}

@Repository(DB_DIR, 'operator.db')
export class OperatorRepo extends BaseRepo<IOT.Operator> {

  async init() {
    try {
      await this.pouchdb.createIndex({ index: { fields: ['cid'], ddoc: 'idx-cid' } })
      await this.pouchdb.createIndex({ index: { fields: ['uid'], ddoc: 'idx-uid' } })
      await this.pouchdb.createIndex({ index: { fields: ['cid', 'timestamp'], ddoc: 'idx-timestamp' } })
    } catch (err) {
      console.error('initDB', err)
    }
  }

  public async pagedGet(cid: string, page: number, pageSize: number) {
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

  public async update(item: IOT.Operator) {
    let result = null
    let getResult = await this.get('uid', item.uid, ['_id', '_rev'])
    if (getResult != null) {
      item._id = getResult._id
      item._rev = getResult._rev
      result = await this.pouchdb.put(item)
    } else {
      result = await this.pouchdb.post(item)
    }

    if (result.ok)
      return result.id
    else
      throw '更新失败'
  }

  public async delete(uid: string) {
    let result = false
    try {
      let item = await this.get('uid', uid, ['_id', '_rev'])
      let removeResult = await this.pouchdb.remove(item._id, item._rev)
      result = removeResult.ok
    } catch (err) {
      throw '删除失败' + err
    } finally {
      return result
    }
  }

}