import { UploadedFile } from 'express-fileupload'
import { Autowired, Service } from 'lynx-express-mvc'
import path from 'path'
import { STATIC_DIR } from '../../common/env.const'
import { Chatroom } from '../../models'
import { ChatroomRepo, RoomCollectionRepo, SeatInfoRepo, SeatReqRepo } from '../../repository/chatroom.repo'
import MQClient from '../mqtt.client'
import UserService from '../user.service'
import CustomEmojis from './data/emoji.basic.json'
import ToolEmojis from './data/emoji.tools.json'
import { GiftService } from './gift.service'
import { PropService } from './prop.service'


@Service()
export class ChatroomService {

  @Autowired()
  private userService: UserService

  @Autowired()
  private propService: PropService

  @Autowired()
  private giftService: GiftService

  @Autowired()
  private mqClient: MQClient

  @Autowired()
  private chatroomRepo: ChatroomRepo

  @Autowired()
  private seatInfoRepo: SeatInfoRepo

  @Autowired()
  private seatReqRepo: SeatReqRepo

  @Autowired()
  private roomCollectionRepo: RoomCollectionRepo

  async getRoomInfo(roomId: string) {

    let room = await this.chatroomRepo.get('_id', roomId)

    return room
  }

  async save(room: Chatroom.Room, cover: UploadedFile, token: string) {
    let uid = await this.userService.token2uid(token)
    let profile = await this.userService.getUserInfo(uid)

    if (cover != null) {
      let ext = cover.name.split('.').pop()
      await cover.mv(path.join(STATIC_DIR, cover.md5 + '.' + ext))
      room.cover = `/_res/${cover.md5}.${ext}`
    }
    room.owner = profile.uid

    if (room._id) {
      let existRoom = await this.chatroomRepo.get('_id', room._id)
      room._rev = existRoom._rev
      return await this.chatroomRepo.updateRoom(room)
    }
    let existRooms = await this.chatroomRepo.getRooms(profile.uid, room.type)
    if (existRooms.length > 0) {
      throw '已有同类型频道，请删除后再创建'
    } else {
      let roomId = await this.chatroomRepo.saveRoom(room)
      let seats = this.genRoomSeats(roomId, room.type)
      await this.seatInfoRepo.saveRoomSeats(roomId, seats)
    }
  }

  async getMyCollections(uid: string) {
    let collections = await this.roomCollectionRepo.getCollectionRooms(uid)

    let roomIds = collections.map(it => { return it.roomId })
    let result = await this.chatroomRepo.bulkRooms(roomIds)

    result.forEach(it => {
      delete it._rev
    })

    return result
  }

  async collectRoom(roomId: string, token: string) {
    let uid = await this.userService.token2uid(token)

    let collection: Chatroom.RoomCollection = {
      uid, roomId,
      timestamp: new Date().getTime()
    }

    await this.roomCollectionRepo.updateCollection(collection)
  }

  async getMyRooms(token: string) {
    let uid = await this.userService.token2uid(token)
    let profile = await this.userService.getUserInfo(uid)
    let rooms = await this.chatroomRepo.getRooms(profile.uid)
    rooms.forEach(it => {
      it.ownerName = profile.name
    })
    return rooms
  }

  async recommends(uid: string, page: number) {
    let rooms = await this.chatroomRepo.search()
    return [...rooms]
  }

  async getEmojiGroups(roomId: string) {
    return [{ name: '工具', emojis: ToolEmojis }, { name: '常用', emojis: CustomEmojis }] as Array<Chatroom.EmojiGroup>
  }

  async enter(roomId: string, token: string) {

    let uid = await this.userService.token2uid(token)
    let room = await this.chatroomRepo.get('_id', roomId)
    let profile = await this.userService.getUserInfo(room.owner)
    let seats = await this.seatInfoRepo.getRoomSeats(roomId)

    seats.forEach(it => {
      delete it._rev
    })

    let isCollected = await this.roomCollectionRepo.isCollected(uid, roomId)
    room.seats = seats
    room.ownerName = profile.name
    room.isStared = isCollected

    let masters = await this.userService.bulkUsers(room.masters)

    room.displayMasters = masters

    delete room._rev
    return room //  this.mockRoomInfo()
  }

  async leave(roomId: string, token: string) {
    let uid = await this.userService.token2uid(token)
    let profile = await this.userService.getUserInfo(uid)
    let seats = await this.seatInfoRepo.getRoomSeats(roomId)

    let onSeat = seats.find(it => { return it.userInfo?.uid == profile.uid })

    let msgs = []

    if (onSeat) {
      onSeat.userInfo = null
      await this.seatInfoRepo.updateSeat(onSeat)

      let seatDownMsg = {
        type: Chatroom.MsgType.SeatDown,
        seq: onSeat.seq
      }

      msgs.push(seatDownMsg)
    }

    let msg: Chatroom.Message = {
      type: Chatroom.MsgType.Exit,
      content: `${profile.name} 离开了房间`
    }
    msgs.push(msg)
    this.mqClient.sendMsg(`_room/${roomId}`, JSON.stringify(msgs))

    return 'success'
  }

  async reward(roomId: string, giftId: string, count: number, receivers: string[], token: string) {
    let uid = await this.userService.token2uid(token)
    let from = await this.userService.getUserInfo(uid)
    let gift = await this.giftService.buyGift(from.uid, giftId, count, receivers)

    let rewardMsgs = receivers.map(it => {
      return { type: Chatroom.MsgType.Reward, giftId, count } as Chatroom.Message
    })

    let sysMsgs = []

    for (let it of receivers) {
      let to = await this.userService.getUserInfo(it)
      let content = `<span style="font-size: 0.8rem; font-style: italic; color: #8e44ad;"> ${from.name} </span> 向 <span style="font-size: 0.8rem; font-style: italic; color: #e67e22;"> ${to.name} </span> 赠送了 <span style="font-size: 1rem; font-style: italic; font-weight: bold; color: #f39c12;"> ${count} </span> 个 <span>${gift.title}</span>`
      sysMsgs.push({ type: Chatroom.MsgType.Sys, content })
    }

    this.mqClient.sendMsg(`_room/${roomId}`, JSON.stringify([...rewardMsgs, ...sysMsgs]))
    return 'success'
  }

  async seatRequests(roomId: string) {
    let reqs = await this.seatReqRepo.getSeatReq(roomId)
    let uids = reqs.map(it => { return it.uid })
    let users = await this.userService.bulkUsers(uids)

    let result = users.map(user => {
      let req = reqs.find((it) => { return it.uid == user.uid })

      return Object.assign(user, req)
    })
    return result
  }

  async seatReq(roomId: string, seq: number, code: Chatroom.MsgType, token: string) {
    let uid = await this.userService.token2uid(token)

    switch (code) {
      case Chatroom.MsgType.SeatOnReq: { //
        let req: Chatroom.SeatReq = {
          uid, roomId, seatSeq: seq,
          timestamp: new Date().getTime()
        }
        await this.seatReqRepo.addSeatReq(req)
        return '正在排麦中'
      }
      case Chatroom.MsgType.SeatOnReqCancel: {
        let req: Chatroom.SeatReq = {
          uid, roomId, seatSeq: seq
        }
        await this.seatReqRepo.removeSeatReq(req)
        return 'success'
      }
      case Chatroom.MsgType.SeatOn: {
        let room = await this.chatroomRepo.get('_id', roomId)
        let seat = await this.seatInfoRepo.getRoomSeat(roomId, seq)
        if (room.masters.includes(uid) || room.owner == uid) {
          return await this.seatOn(seat, uid)
        } else {
          throw '你没有直接上麦权限，请排麦'
        }
      }
      case Chatroom.MsgType.SeatDown: {
        let seat = await this.seatInfoRepo.getRoomSeat(roomId, seq)
        return await this.seatDown(seat, uid)
      }
    }
  }

  async seatMgr(roomId: string, seq: number, uid: string, code: Chatroom.MsgType, token: string) {
    let myself = await this.userService.token2uid(token)
    let room = await this.chatroomRepo.get('_id', roomId)
    let seat = await this.seatInfoRepo.getRoomSeat(roomId, seq)

    if (seat == null) throw '座位信息错误'
    if (!room.masters.includes(myself) && room.owner != myself) throw '你没有权限操作房间座位'

    switch (code) {
      case Chatroom.MsgType.SeatOn:
        return await this.seatOn(seat, uid)
      case Chatroom.MsgType.SeatDown:
        return await this.seatDown(seat, uid)
      case Chatroom.MsgType.SeatLock:
      case Chatroom.MsgType.SeatUnlock:
        return await this.seatLock(seat, code)
      case Chatroom.MsgType.SeatMute:
      case Chatroom.MsgType.SeatUnmute:
        return await this.seatMute(seat, code)
    }
  }

  private async seatOn(seat: Chatroom.Seat, uid: string) {

    let req: Chatroom.SeatReq = {
      uid, roomId: seat.roomId, seatSeq: seat.seq
    }

    let profile = await this.userService.getUserInfo(uid)
    let props = await this.propService.getUserUsingProps(uid)

    if (seat.userInfo != null) {
      throw '当前座位上有嘉宾，请先下麦'
    }

    let userInfo = Object.assign(profile, props)

    seat.userInfo = userInfo
    await this.seatInfoRepo.updateSeat(seat)
    await this.seatReqRepo.removeSeatReq(req)

    let msg: Chatroom.Message = {
      userInfo,
      type: Chatroom.MsgType.SeatOn,
      seq: seat.seq
    }
    this.mqClient.sendMsg(`_room/${seat.roomId}`, JSON.stringify([msg]))

    return 'success'
  }

  private async seatDown(seat: Chatroom.Seat, uid: string) {
    if (seat.userInfo == null || seat.userInfo.uid != uid) {
      throw '座位信息错误'
    }
    let userInfo = seat.userInfo
    delete seat.userInfo
    await this.seatInfoRepo.updateSeat(seat)

    let msg: Chatroom.Message = {
      userInfo,
      type: Chatroom.MsgType.SeatDown,
      seq: seat.seq
    }
    this.mqClient.sendMsg(`_room/${seat.roomId}`, JSON.stringify([msg]))

    return 'success'
  }

  private async seatMute(seat: Chatroom.Seat, code: Chatroom.MsgType) {
    seat.isMute = code == Chatroom.MsgType.SeatMute
    await this.seatInfoRepo.updateSeat(seat)
    let msg: Chatroom.Message = {
      type: code,
      seq: seat.seq
    }
    this.mqClient.sendMsg(`_room/${seat.roomId}`, JSON.stringify([msg]))
    return 'success'
  }

  private async seatLock(seat: Chatroom.Seat, code: Chatroom.MsgType) {
    seat.isLocked = code == Chatroom.MsgType.SeatLock
    if (seat.isLocked) {
      delete seat.userInfo
    }
    await this.seatInfoRepo.updateSeat(seat)

    let msg: Chatroom.Message = {
      type: code,
      seq: seat.seq
    }
    this.mqClient.sendMsg(`_room/${seat.roomId}`, JSON.stringify([msg]))
    return 'success'
  }

  async sendMsg(roomId: string, msg: Chatroom.Message, token: string) {
    let uid = await this.userService.token2uid(token)
    if (uid != msg.userInfo.uid) throw '用户信息错误，请重新登录'

    this.mqClient.sendMsg(`_room/${roomId}`, JSON.stringify([msg]))
    return 'send success'
  }

  private genRoomSeats(roomId: string, type: Chatroom.RoomType) {
    let guestSeatCount = 0
    let seats = Array<Chatroom.Seat>()
    let seat: Chatroom.Seat = {
      roomId,
      seq: 0,
      type: Chatroom.SeatType.Host,
      isLocked: false,
      isMute: false,
    }
    seats.push(seat)
    switch (type) {
      case Chatroom.RoomType.DianTai:
        guestSeatCount = 2
        break
      case Chatroom.RoomType.JiaoYou:
        guestSeatCount = 4
        break

      case Chatroom.RoomType.YuLe:
        guestSeatCount = 7
        break
    }
    for (let i = 1; i <= guestSeatCount; ++i) {
      seat = {
        roomId,
        seq: i,
        type: Chatroom.SeatType.Guest,
        isLocked: false,
        isMute: false,
      }
      seats.push(seat)
    }
    return seats
  }
}