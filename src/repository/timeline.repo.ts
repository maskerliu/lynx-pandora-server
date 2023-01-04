import { Repository } from 'lynx-express-mvc'
import { DB_DIR } from '../common/env.const'
import BaseRepo from './base.repo'
import { Common, Timeline } from '../models'


@Repository(DB_DIR, 'post.db')
export class PostRepo extends BaseRepo<any> {

  async init() {
    try {
      await this.pouchdb.createIndex({ index: { fields: ['uid', 'timestamp'], ddoc: 'idx-uid' } })
    } catch (err) {
      console.error('initDB', err)
    }
  }

  async getPagedPosts(uid: string, page: number, pageSize: number) {
    let req: PouchDB.Find.FindRequest<any> = {
      selector: {
        uid: uid,
        timestamp: { $lt: new Date().getTime() }
      },
      limit: pageSize,
      skip: page * pageSize,
      sort: [{ 'uid': 'asc' }, { 'timestamp': 'desc' }],
      use_index: 'idx-uid'
    }
    let resp = await this.pouchdb.find(req)

    return resp.docs.map(it => {
      delete it._rev
      return it as Timeline.Post
    })
  }
}


@Repository(DB_DIR, 'moment.db')
export class MomentRepo extends BaseRepo<Timeline.Moment> {

  async init() {
    try {
      await this.pouchdb.createIndex({ index: { fields: ['uid', 'timestamp'], ddoc: 'idx-uid' } })
    } catch (err) {
      console.error('initDB', err)
    }
  }

  async getPagedMoments(uid: string, page: number, pageSize: number) {
    let req: PouchDB.Find.FindRequest<any> = {
      selector: {
        uid: uid,
        timestamp: { $lt: new Date().getTime() }
      },
      limit: pageSize,
      skip: page * pageSize,
      sort: [{ 'uid': 'asc' }, { 'timestamp': 'desc' }],
      use_index: 'idx-uid'
    }
    let resp = await this.pouchdb.find(req)

    return resp.docs.map(it => {
      delete it._rev
      return it as Timeline.Post
    })
  }

  async saveMoment(moment: Timeline.Moment) {
    let resp = await this.pouchdb.post(moment)
    if (resp.ok) return resp.id
    else throw 'fail to save moment'
  }

  async updateMoment(moment: Timeline.Moment) {
    let resp = await this.pouchdb.put(moment)
    if (resp.ok) return resp.id
    else throw 'fail to update moment'
  }

  async deleteMoment(doc: { _id: string, _rev: string }) {
    let resp = await this.pouchdb.remove(doc)
    if (resp.ok) return 'success'
    else throw 'fail to delete moment'
  }
}

@Repository(DB_DIR, 'comment.db')
export class CommentRepo extends BaseRepo<Timeline.Comment> {

  async init() {
    try {
      await this.pouchdb.createIndex({ index: { fields: ['type', 'uid', 'timestamp'], ddoc: 'idx-uid' } })
    } catch (err) {
      console.error('initDB', err)
    }
  }

  async bulkComments(type: Timeline.CommentType, postIds: Array<string>) {
    let req: PouchDB.Find.FindRequest<any> = {
      selector: {
        type,
        postId: { $in: postIds },
        timestamp: { $lt: new Date().getTime() }
      },
      limit: 5,
      sort: [{ 'timestamp': 'desc' }],
      use_index: 'idx-uid'
    }
  }

  async pagedComments(type: Timeline.CommentType, postId: string, page: number, pageSize: number) {

    let req: PouchDB.Find.FindRequest<any> = {
      selector: {
        type, postId,
        timestamp: { $lt: new Date().getTime() }
      },
      sort: [{ 'timestamp': 'desc' }],
      skip: page * pageSize,
      use_index: 'idx-uid'
    }

    let resp = await this.pouchdb.find(req)
    return resp.docs.map(it => {
      delete it._rev
      return it as Timeline.Comment
    })
  }

  async saveComment(comment: Timeline.Comment) {
    let resp = await this.pouchdb.post(comment)
    if (resp.ok) return resp.id
    else throw 'fail to save comment'
  }

  async deleteComment(doc: { _id: string, _rev: string }) {
    let resp = await this.pouchdb.remove(doc)
    if (resp.ok) return 'success'
    else throw 'fail to delete comment'
  }
}