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
    let req: any = {
      selector: {
        _id: { $ne: /_design\/idx/ },
      },
      limit: 1,
      fields: returnFields
    }
    req.selector[field] = { $eq: query }
    let result = await this.find(req)
    if (result.length > 0) return result[0] as T
    else return null
  }

  // public async bulkGet(ids: Array<string>) {
  //   let req: PouchDB.Find.FindRequest<any> = {
  //     selector: {
  //       _id: { $in: ids }
  //     }
  //   }
  //   return await this.find(req)
  // }

  public async find(request: PouchDB.Find.FindRequest<any>) {
    let resp = await this.pouchdb.find(request)
    return resp.docs.map(it => {
      return it as T
    })
  }

  public async add(item: T) {
    if (item._id) throw 'cant add a item with _id'
    let resp = await this.pouchdb.post(item)
    if (resp.ok) return resp.id
    else throw 'fail to add'
  }

  public async save(item: T) {
    let dbItem = await this.pouchdb.get(item._id)
    if (dbItem == null || dbItem._rev == null) throw 'cant save a item withour _id or _rev'
    item._rev = dbItem._rev
    let resp = await this.pouchdb.put(item)
    if (resp.ok) return resp.id
    else throw 'fail to save'
  }

  public async bulkDocs(items: Array<T>) {
    let resp = await this.pouchdb.bulkDocs(items)
    return resp.map(it => { return it.id })
  }

  public async remove(id: string, rev: string) {
    let resp = await this.pouchdb.remove(id, rev)
    return resp.ok
  }

}