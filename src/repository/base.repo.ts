import { Common } from '../models/common.model'
import 'pouchdb-node'

export default abstract class BaseRepo<T extends Common.DBDoc> {

  pouchdb: PouchDB.Database

  abstract init(): Promise<void>

  public async replicate() {
    let tmpDB = new PouchDB('tmp.db')
    let dbname = this.pouchdb.name
    let result = await this.pouchdb.info()
    let originalTableSize = result.doc_count

    PouchDB.replicate(this.pouchdb, tmpDB, {
      filter: (doc) => {
        if (doc._deleted)
          return false
        else
          return doc
      }
    }).on('complete', async () => {
      await this.pouchdb.destroy()
      this.pouchdb = new PouchDB(dbname)
      await this.init()
      PouchDB.replicate(tmpDB, this.pouchdb).on('complete', async () => { await tmpDB.destroy() })
    })
  }

  public async search(field?: string, query?: string, returnFields?: Array<string>) {
    let request: PouchDB.Find.FindRequest<any> = {
      selector: {
        _id: { $ne: /_design\/idx/ },
      },
      limit: 15,
      fields: returnFields
    }

    if (query != null) {
      request.selector[field] = { $regex: new RegExp(`${query}`) }
    }
    let result = await this.find(request)
    result.forEach(it => { delete it._rev })
    return result
  }

  public async get(field: string, query: string, returnFields?: Array<string>) {
    let request: any = {
      selector: {
        _id: { $ne: /_design\/idx/ },
      },
      limit: 15,
      fields: returnFields
    }
    request.selector[field] = { $eq: query }
    let result = await this.find(request)
    return result[0]
  }

  public async find(request: PouchDB.Find.FindRequest<any>) {
    let data: Array<T> = new Array()
    let result = await this.pouchdb.find(request)
    if (result.docs) {
      result.docs.forEach(it => {
        data.push(it as T)
      })
    }
    return data
  }

  public async update(item: T) {
    let result = null
    if (item._id != null) {
      let getResult = await this.get('_id', item._id, ['_rev'])
      if (getResult != null) {
        item._rev = getResult._rev
        result = await this.pouchdb.put(item)
      } else {
        result = await this.pouchdb.post(item)
      }
    } else {
      result = await this.pouchdb.post(item)
    }

    if (result.ok)
      return result.id
    else
      throw '更新失败'
  }

  public async delete(id: string) {
    let result = false
    try {
      let item = await this.get('_id', id, ['_id', '_rev'])
      let removeResult = await this.pouchdb.remove(item._id, item._rev)
      result = removeResult.ok
    } catch (err) {
      throw '删除失败' + err
    } finally {
      return result
    }
  }
}