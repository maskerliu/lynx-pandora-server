import { Repository } from 'lynx-express-mvc'
import { DB_DIR } from '../common/env.const'
import { IM } from '../models/im.model'
import BaseRepo from './base.repo'


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

  public async update(item: IM.Session) {
    let result = null
    let getResult = await this.get('sid', item.sid, ['_id', '_rev'])
    if (getResult != null) {
      item._rev = getResult._rev
      item._id = getResult._id
      result = await this.pouchdb.put(item)
    } else {
      result = await this.pouchdb.post(item)
    }

    if (result.ok)
      return result.id
    else
      throw '更新失败'
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

  async put(message: IM.Message) {
    await this.pouchdb.post(message)
  }

  async bulkGet(uid: string) {
    let opt: PouchDB.Find.FindRequest<any> = {
      selector: {
        to: uid
      },
    }
    let resp = await this.pouchdb.find(opt)

    let docs = resp.docs.map(it => {
      return { _id: it._id, _rev: it._rev, _deleted: true }
    })

    await this.pouchdb.bulkDocs(docs)

    return resp.docs.map(it => {
      delete it._id
      delete it._rev
      delete it['to']
      return it as IM.Message
    })
  }
}