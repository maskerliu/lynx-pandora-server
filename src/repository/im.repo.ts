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