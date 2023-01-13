import { Repository } from 'lynx-express-mvc'
import { DB_DIR } from '../common/env.const'
import { Chatroom } from '../models'
import BaseRepo from './base.repo'

@Repository(DB_DIR, 'chatroom-collection.db')
export class RoomCollectionRepo extends BaseRepo<Chatroom.RoomCollection> {

  async init() {
    try {
      await this.pouchdb.createIndex({ index: { fields: ['uid', 'timestamp'], ddoc: 'idx-uid' } })
    } catch (err) {
      console.error('initDB', err)
    }
  }

  async getCollectionRooms(uid: string) {
    let req: PouchDB.Find.FindRequest<any> = {
      selector: {
        uid,
        timestamp: { $gt: 0 },
      },
      sort: [{ 'uid': 'asc' }, { 'timestamp': 'desc' }],
      use_index: 'idx-uid'
    }
    let resp = await this.pouchdb.find(req)
    return resp.docs as Array<Chatroom.RoomCollection>
  }

  async isCollected(uid: string, roomId: string) {
    let req: PouchDB.Find.FindRequest<any> = {
      selector: { uid, roomId }
    }
    let result = await this.pouchdb.find(req)
    return result.docs.length > 0
  }

  public async updateCollection(collection: Chatroom.RoomCollection) {
    let req: PouchDB.Find.FindRequest<any> = {
      selector: { uid: collection.uid, roomId: collection.roomId }
    }
    let result = await this.pouchdb.find(req)

    if (result.docs.length > 0) {
      await this.pouchdb.remove({ _id: result.docs[0]._id, _rev: result.docs[0]._rev })
    } else {
      await this.pouchdb.post(collection)
    }
  }

}

@Repository(DB_DIR, 'chatroom.db')
export class ChatroomRepo extends BaseRepo<Chatroom.Room> {

  async init() {
    try {
      await this.pouchdb.createIndex({ index: { fields: ['owner'], ddoc: 'idx-uid' } })
    } catch (err) {
      console.error('initDB', err)
    }
  }

  async getRooms(uid: string, type?: Chatroom.RoomType) {
    let request: PouchDB.Find.FindRequest<any> = {
      selector: {
        owner: uid, type
      },
      use_index: 'idx-uid'
    }
    let resp = await this.pouchdb.find(request)

    return resp.docs as Array<Chatroom.Room>
  }

  async bulkRooms(roomIds: string[]) {
    let req: PouchDB.Find.FindRequest<any> = {
      selector: {
        _id: { $in: roomIds }
      }
    }

    let resp = await this.pouchdb.find(req)
    return resp.docs as Array<Chatroom.Room>
  }

  async saveRoom(room: Chatroom.Room) {
    let resp = await this.pouchdb.post(room)
    return resp.id
  }

  async updateRoom(room: Chatroom.Room) {
    let resp = await this.pouchdb.put(room)
    return resp.id
  }
}

@Repository(DB_DIR, 'chatroom-seat-info.db')
export class SeatInfoRepo extends BaseRepo<Chatroom.Seat>{
  async init() {
    try {
      await this.pouchdb.createIndex({ index: { fields: ['roomId', 'seq'], ddoc: 'idx-room' } })
    } catch (err) {
      console.error('initDB', err)
    }
  }

  async getRoomSeat(roomId: string, seq: number) {
    let request: PouchDB.Find.FindRequest<any> = {
      selector: { roomId, seq },
      sort: [{ 'roomId': 'asc' }, { 'seq': 'asc' }],
      use_index: 'idx-room'
    }
    let resp = await this.pouchdb.find(request)
    return resp.docs[0] as Chatroom.Seat
  }

  async updateSeat(seat: Chatroom.Seat) {
    await this.pouchdb.put(seat)
  }

  async getRoomSeats(roomId: string) {
    let request: PouchDB.Find.FindRequest<any> = {
      selector: {
        roomId,
        seq: { $gt: -1 }
      },
      sort: [{ 'roomId': 'asc' }, { 'seq': 'asc' }],
      use_index: 'idx-room'
    }
    let resp = await this.pouchdb.find(request)
    return resp.docs as Array<Chatroom.Seat>
  }

  async saveRoomSeats(roomId: string, seats: Array<Chatroom.Seat>) {
    let request: PouchDB.Find.FindRequest<any> = {
      selector: { roomId },
      fields: ['_id', '_rev']
    }
    let resp = await this.pouchdb.find(request)

    resp.docs.forEach(it => {
      it['_deleted'] = true
    })
    await this.pouchdb.bulkDocs(resp.docs)
    await this.pouchdb.bulkDocs(seats)
  }

  async updateRoomSeats(roomId: string, seats: Array<Chatroom.Seat>) {


    let docs = seats.map(it => { return { id: it._id } })

    let resp = await this.pouchdb.bulkGet({ docs })

    resp.results.forEach(it => {

      it.docs[0]['ok']
    })
  }
}

@Repository(DB_DIR, 'chatroom-seat-req.db')
export class SeatReqRepo extends BaseRepo<Chatroom.SeatReq> {
  async init() {
    try {
      await this.pouchdb.createIndex({ index: { fields: ['roomId', 'timestamp'], ddoc: 'idx-room' } })
    } catch (err) {
      console.error('initDB', err)
    }
  }

  async getSeatReq(roomId: string) {
    let request: PouchDB.Find.FindRequest<any> = {
      selector: { roomId, timestamp: { $lt: new Date().getTime() } },
      sort: [{ 'roomId': 'asc' }, { 'timestamp': 'asc' }],
      use_index: 'idx-room'
    }
    let resp = await this.pouchdb.find(request)
    return resp.docs as Array<Chatroom.SeatReq>
  }

  async addSeatReq(seatReq: Chatroom.SeatReq) {
    let req: PouchDB.Find.FindRequest<any> = {
      selector: {
        uid: seatReq.uid,
        roomId: seatReq.roomId
      }
    }
    let resp = await this.pouchdb.find(req)
    if (resp.docs.length > 0) { throw '已在排麦，请耐心等待' }

    await this.pouchdb.post(seatReq)
  }

  async removeSeatReq(seatReq: Chatroom.SeatReq) {
    let req: PouchDB.Find.FindRequest<any> = {
      selector: {
        uid: seatReq.uid,
        roomId: seatReq.roomId
      }
    }
    let resp = await this.pouchdb.find(req)
    if (resp.docs.length > 0) {
      await this.pouchdb.remove({ _id: resp.docs[0]._id, _rev: resp.docs[0]._rev })
    }
  }
}

// Emoji
@Repository(DB_DIR, 'chatroom-emoji.db')
export class EmojiRepo extends BaseRepo<Chatroom.Emoji> {
  async init() {
    try {
      await this.pouchdb.createIndex({ index: { fields: ['type', 'status'], ddoc: 'idx-emoji' } })
    } catch (err) {
      console.error('initDB', err)
    }
  }

  async importData(emojis: Array<Chatroom.Emoji>) {
    await this.pouchdb.bulkDocs(emojis)
  }

  async getEmojis() {
    let req: PouchDB.Find.FindRequest<any> = {
      selector: { status: Chatroom.EmojiStatus.On }
    }

    let resp = await this.pouchdb.find(req)
    return resp.docs.map(it => {
      delete it._rev
      return it as Chatroom.Emoji
    })
  }
}

// 礼物
@Repository(DB_DIR, 'chatroom-gift.db')
export class GiftRepo extends BaseRepo<Chatroom.Gift> {

  async init() {
    try {
      await this.pouchdb.createIndex({ index: { fields: ['type', 'status', 'price'], ddoc: 'idx-type' } })
    } catch (err) {
      console.error('initDB', err)
    }
  }

  async importData(gifts: Array<Chatroom.Gift>) {
    await this.pouchdb.bulkDocs(gifts)
  }

  async getGifts(roomId: string, type: Chatroom.GiftType) {
    let req: PouchDB.Find.FindRequest<any> = {
      selector: {
        type,
        status: Chatroom.GiftStatus.On,
        price: { $gt: -1 }
      },
      sort: [{ 'type': 'asc' }, { 'status': 'asc' }, { 'price': 'asc' }],
      use_index: 'idx-type'
    }

    let resp = await this.pouchdb.find(req)
    return resp.docs.map(it => {
      delete it._rev
      return it as Chatroom.Gift
    })
  }
}

// 道具
@Repository(DB_DIR, 'chatroom-prop.db')
export class PropRepo extends BaseRepo<Chatroom.Prop>{
  async init() {
    try {
      await this.pouchdb.createIndex({ index: { fields: ['uid'], ddoc: 'idx-uid' } })
    } catch (err) {
      console.error('initDB', err)
    }
  }

  async importData(props: Array<Chatroom.Prop>) {
    await this.pouchdb.bulkDocs(props)
  }

  async bulkProps(docs: Array<{ id: string }>) {
    let resp = await this.pouchdb.bulkGet({ docs })

    let props = resp.results.map(it => {
      let prop = it.docs[0]['ok'] as Chatroom.Prop
      delete prop._rev
      return prop
    })

    return props
  }

  async getProps(type: Chatroom.PropType) {
    let req: PouchDB.Find.FindRequest<any> = {
      selector: {
        type
      },
    }
    let resp = await this.pouchdb.find(req)

    return resp.docs.map(it => {
      delete it._rev
      return it as Chatroom.Prop
    })
  }
}

// 道具购买记录
@Repository(DB_DIR, 'chatroom-prop-order.db')
export class PropOrderRepo extends BaseRepo<Chatroom.PropOrder>{
  async init() {
    try {
      await this.pouchdb.createIndex({ index: { fields: ['uid', 'timestamp'], ddoc: 'idx-uid' } })
    } catch (err) {
      console.error('initDB', err)
    }
  }

  async orderExisted(propId: string, uid: string) {

    let req: PouchDB.Find.FindRequest<any> = {
      selector: {
        uid, propId,
        expired: { $gte: new Date().getTime() }
      },
      limit: 1,
    }
    let resp = await this.pouchdb.find(req)
    return resp.docs.length > 0
  }

  async getUserVaildPropOrder(uid: string) {
    let time = new Date().getTime()
    let req: PouchDB.Find.FindRequest<any> = {
      selector: {
        uid,
        timestamp: { $lt: time },
        expired: { $gte: time }
      },
      sort: [{ uid: 'asc' }, { timestamp: 'asc' }],
      use_index: 'idx-uid'
    }

    let resp = await this.pouchdb.find(req)
    return resp.docs.map(it => { return it as Chatroom.PropOrder })
  }

  async getUserUsingProps(uid: string) {
    let time = new Date().getTime()
    let req: PouchDB.Find.FindRequest<any> = {
      selector: {
        uid,
        timestamp: { $lt: time },
        expired: { $gte: time },
        status: Chatroom.PropOrderStatus.On,
      },
      sort: [{ uid: 'asc' }, { timestamp: 'asc' }],
      use_index: 'idx-uid'
    }

    let resp = await this.pouchdb.find(req)
    return resp.docs.map(it => { return it as Chatroom.PropOrder })
  }

  async addOrder(order: Chatroom.PropOrder) {
    delete order._id
    delete order._rev
    let resp = await this.pouchdb.post(order)
    if (resp.ok) return resp.id
    else throw 'fail to add prop order'
  }

  async saveOrder(order: Chatroom.PropOrder) {
    let resp = await this.pouchdb.put(order)
    if (resp.ok) return resp.id
    else throw 'fail to update prop order'
  }
}

// 礼物购买记录
@Repository(DB_DIR, 'chatroom-gift-order.db')
export class GiftOrderRepo extends BaseRepo<Chatroom.GiftOrder>{
  async init() {
    try {
      await this.pouchdb.createIndex({ index: { fields: ['uid', 'timestamp'], ddoc: 'idx-uid' } })
    } catch (err) {
      console.error('initDB', err)
    }
  }

  async addOrder(order: Chatroom.GiftOrder) {
    let resp = await this.pouchdb.post(order)
    if (resp.ok) return resp.id
    else throw 'fail to add gift order'
  }

  async updateOrder(order: Chatroom.GiftOrder) {
    let resp = await this.pouchdb.put(order)
    if (resp.ok) return resp.id
    else throw 'fail to add gift order'
  }
}

@Repository(DB_DIR, 'chatroom-reward-record.db')
export class RewardRecordRepo extends BaseRepo<Chatroom.RewardRecord>{
  async init() {
    try {
      await this.pouchdb.createIndex({ index: { fields: ['uid', 'timestamp'], ddoc: 'idx-uid' } })
    } catch (err) {
      console.error('initDB', err)
    }
  }

  async addRecords(records: Array<Chatroom.RewardRecord>) {
    await this.pouchdb.bulkDocs(records)
  }
}