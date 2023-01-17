import { Service } from 'lynx-express-mvc'
import path from 'path'
import { DB_DIR } from '../common/env.const'
import { Common } from '../models'
import PouchDB from 'pouchdb-node'


@Service()
export default class DBMgrService {

  private dbInfos: Array<string> = [
    'user-account.db',
    'user-profile.db',
    'company.db',
    'role.db',
    'operator.db',
    'iot-device.db',
    'iot-monitor-data.db',
    'im-session.db'
  ]

  // private dbs: Array<PouchDB.Database> = new Array()
  private dbs: Map<string, PouchDB.Database> = new Map()
  constructor() {
    this.dbInfos.forEach(item => {
      this.dbs.set(item, new PouchDB(path.join(DB_DIR, item)))
    })
  }


  async getAllDB() {
    let result: Array<Common.DBInfo> = new Array()

    for (let key of this.dbs.keys()) {
      let info = await this.dbs.get(key).info()
      result.push({ name: key, path: info.db_name, size: info.doc_count })
    }

    return result
  }

  async getDoc(dbName: string) {
    let db = this.dbs.get(dbName)
    return await db.allDocs({ include_docs: true, attachments: true })
  }
  
  async deleteDoc(dbName: string, docId: string, revId: string) {
    let db = this.dbs.get(dbName)
    await db.remove(docId, revId)
  }

  async updateDoc(dbName: string, doc: any) {
    let db = this.dbs.get(dbName)
    await db.put(doc)
  }
}