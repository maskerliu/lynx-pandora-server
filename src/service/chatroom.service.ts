import { UploadedFile } from 'express-fileupload'
import { Autowired, Service } from 'lynx-express-mvc'
import path from 'path'
import { getLocalIP } from '../common/common.utils'
import { STATIC_DIR } from '../common/env.const'
import { Chatroom } from '../models'
import { ChatroomRepo, GiftRepo, RoomCollectionRepo, SeatInfoRepo, SeatReqRepo } from '../repository/chatroom.repo'
import CustomEmojis from './emoji.chatroom.json'
import ToolEmojis from './emoji.tools.json'
import Gift from './gifts.data.json'
import MQClient from './mqtt.client'
import UserService from './user.service'


@Service()
export class ChatroomService {

  @Autowired()
  userService: UserService

  @Autowired()
  mqClient: MQClient

  @Autowired()
  chatroomRepo: ChatroomRepo

  @Autowired()
  seatInfoRepo: SeatInfoRepo

  @Autowired()
  seatReqRepo: SeatReqRepo

  @Autowired()
  giftRepo: GiftRepo

  @Autowired()
  roomCollectionRepo: RoomCollectionRepo

  async getRoomInfo(roomId: string) {

    let room = await this.chatroomRepo.get('_id', roomId)

    return room
  }

  async save(room: Chatroom.Room, cover: UploadedFile, token: string) {
    let profile = await this.userService.getUserInfoByToken(token)

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
    let profile = await this.userService.getUserInfoByToken(token)
    let rooms = await this.chatroomRepo.getRooms(profile.uid)
    rooms.forEach(it => {
      it.ownerName = profile.name
    })
    return rooms
  }

  async getRecommend(uid: string) {

    let rooms = await this.chatroomRepo.search()

    const data: Array<Chatroom.Room> = [
      {
        tags: [
          '电台',
        ],
        cover: 'https://yppphoto.hellobixin.com/upload/0d63c840-796e-11ed-83f1-83d7999600fa.png',
        _id: '27909f54b0304b73be7a66deb54bfd50',
        title: '哈尼播客🎧招募优质NJ',
        notice: ''
      },
      {
        tags: [
          '电台',
        ],
        cover: 'https://yppphoto.hellobixin.com/upload/966493d0-6db7-11ed-92d7-9f05510f8fc2.png',
        _id: '8329cb1b01224120adf9fa8452746479',
        title: 'Link播客🎧招聘小可爱',
        notice: ''
      },
      {
        tags: [
          'vue',
          'webpack',
          'npm'
        ],
        cover: 'https://p6.hellobixin.com/bx-user/7b290d2ba15140ddbb48bb7be420432e.jpg',
        _id: '5d4f9c15910d4cd2b6d00ca38158d28f',
        title: '元气播客🎧清流是烟火的崽崽',
        notice: '01-20 2021'
      },
      {
        tags: [
          '电台',
        ],
        cover: 'https://yppphoto.hellobixin.com/upload/05cfc780-6ec1-11ed-8687-f5e5510c0f89.png',
        _id: '60059f0f0ae17a86a8ca9e12',
        title: '心尼播客🎧招聘优质nj',
        notice: '01-18 2021'
      },
      {
        tags: [
          '点唱',
        ],
        cover: 'https://p6.hellobixin.com/bx-user/a21608165a104426af6407ae3739466a.jpg',
        _id: '93e8d1f87a8545ef9b1276f8f21d13fb',
        title: '[流行&抒情]弦乐-蕊子生日快乐',
      },
      {
        tags: [
          '飞鱼',
        ],
        cover: 'https://p6.hellobixin.com/bx-user/6E42131B-DE8E-4B5E-8150-4119C9A3F97C.jpg',
        _id: '3b64f64c01b249a4a93e2f0fb5b1fdea',
        title: '温柔大貓ι',
        notice: '专属找人房',
      },
      {
        tags: [
          '飞鱼',
        ],
        cover: 'https://p6.hellobixin.com/bx-user/542563a6efb441bf987a46b481d74d0a.jpg',
        _id: '0de1b79fd0a74bdc9ed26560af5c182b',
        title: '回忆QvQ',
        notice: '专属找人房',
      },
      {
        tags: [
          '交友',
        ],
        cover: 'https://p6.hellobixin.com/bx-user/75766e0d28084c1fa07c7c5d48b720b8.jpg',
        outline: '离上篇关于 vue 3.0 的源码学习已经过去老久了，这次要学习的是 reactive.ts 文件，很多东西都看了好几遍，觉得算有点理解了才开始写这个。',
        _id: '2ad392d49d674231a333a419f9d0f5ff',
        title: '惊魂巴士💫',
        notice: '[推理]  招优质DM'
      },
      {
        tags: [
          'demo',
          'test'
        ],
        cover: 'https://t6.hellobixin.com/bx-user/B6475A8B-7871-4015-A6F2-124729606048.jpg',
        outline: '如果图片加载失败，会用默认的错误图片展示。',
        _id: '25f3b11e69ae4960bc710c4e4378eaef',
        title: '星际迷航💫',
        notice: '[海龟汤] 但将行好事,莫要问前程'
      },
      {
        tags: [
          '交友',
        ],
        cover: 'https://p6.hellobixin.com/bx-user/df8e8e92b7354f58a8a8c288415869e7.jpg',
        outline: 'call、apply 方法在实际开发中还是有用到的，学习了它的相关原理，再自己手写一遍来加深自己的理解。',
        _id: 'deb7b56f8f864c9f89420179258da34c',
        title: '快乐星球💫',
        notice: '[海龟汤] 谦忱别臭脸！'
      },
      {
        tags: [
          '交友',
        ],
        cover: 'https://p6.hellobixin.com/bx-user/79cad79f12cc4c25bacd986250ed2d28.jpg',
        outline: '将几个比较有意思的面试题做一个小小的记录。',
        _id: '5e7c35a796575e7d52d442bd',
        title: '梦阁💫',
        notice: '[推理] 林七天天开心'
      }
    ]
    return [...rooms]
  }

  async getEmojiGroups(roomId: string) {
    return [{ name: '工具', emojis: ToolEmojis }, { name: '常用', emojis: CustomEmojis }] as Array<Chatroom.EmojiGroup>
  }

  async getGiftInfo(rid: string) {
    const mockGifts: Array<Chatroom.Gift> = Gift

    return mockGifts
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

    let profile = await this.userService.getUserInfoByToken(token)
    let seats = await this.seatInfoRepo.getRoomSeats(roomId)

    let onSeat = seats.find(it => { return it.userInfo?.uid == profile.uid })

    let msgs = []

    if (onSeat) {
      onSeat.userInfo = null
      await this.seatInfoRepo.updateSeat(onSeat)

      let seatDownMsg = {
        type: Chatroom.MsgType.SeatDown,
        data: { seq: onSeat.seq } as Chatroom.SeatContent
      }

      msgs.push(seatDownMsg)
    }

    let msg: Chatroom.Message = {
      type: Chatroom.MsgType.Exit,
      data: { content: `${profile.name} 离开了房间` } as Chatroom.SysInfoContent
    }
    msgs.push(msg)
    this.mqClient.sendMsg(`_room/${roomId}`, JSON.stringify(msgs))
  }

  async reward(roomId: string, giftId: string, count: number, receivers: string[], token: string) {
    let from = await this.userService.getUserInfoByToken(token)
    let rewardMsgs = receivers.map(it => {
      return {
        type: Chatroom.MsgType.Reward,
        from: from.uid,
        data: { to: it, giftId, count }
      } as Chatroom.Message
    })

    let sysMsgs = []

    for (let it of receivers) {
      let to = await this.userService.getUserInfo(it)
      let content = `<span style="font-size: 0.8rem; font-style: italic; color: #8e44ad;"> ${from.name} </span> 向 <span style="font-size: 0.8rem; font-style: italic; color: #e67e22;"> ${to.name} </span> 赠送了 <span style="font-size: 1rem; font-style: italic; font-weight: bold; color: #f39c12;"> ${count} </span> 个 <span>${Gift[giftId].title}</span>`
      sysMsgs.push({
        type: Chatroom.MsgType.Sys,
        data: { content } as Chatroom.SysInfoContent
      })
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
      case Chatroom.MsgType.SeatReq: { //
        let req: Chatroom.SeatReq = {
          uid, roomId, seatSeq: seq,
          timestamp: new Date().getTime()
        }
        await this.seatReqRepo.addSeatReq(req)
        return '正在排麦中'
      }
      case Chatroom.MsgType.SeatReqCancel: {
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
        return await this.mute(seat, code)
    }
  }

  private async seatOn(seat: Chatroom.Seat, uid: string) {

    let req: Chatroom.SeatReq = {
      uid, roomId: seat.roomId, seatSeq: seat.seq
    }

    let profile = await this.userService.getUserInfo(uid)

    if (seat.userInfo != null) {
      throw '当前座位上有嘉宾，请先下麦'
    }

    seat.userInfo = profile
    await this.seatInfoRepo.updateSeat(seat)
    await this.seatReqRepo.removeSeatReq(req)

    let msg: Chatroom.Message = {
      type: Chatroom.MsgType.SeatOn,
      data: { uid, name: profile.name, avatar: profile.avatar, seq: seat.seq } as Chatroom.SeatContent
    }
    this.mqClient.sendMsg(`_room/${seat.roomId}`, JSON.stringify([msg]))

    return 'success'
  }

  private async seatDown(seat: Chatroom.Seat, uid: string) {
    if (seat.userInfo.uid != uid) {
      throw '座位信息错误'
    }

    delete seat.userInfo
    await this.seatInfoRepo.updateSeat(seat)

    let msg: Chatroom.Message = {
      type: Chatroom.MsgType.SeatDown,
      data: { uid, seq: seat.seq } as Chatroom.SeatContent
    }
    this.mqClient.sendMsg(`_room/${seat.roomId}`, JSON.stringify([msg]))

    return 'success'
  }

  private async mute(seat: Chatroom.Seat, code: Chatroom.MsgType) {
    seat.isMute = code == Chatroom.MsgType.SeatMute
    await this.seatInfoRepo.updateSeat(seat)
    let msg: Chatroom.Message = {
      type: code,
      data: { seq: seat.seq } as Chatroom.SeatContent
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
      data: { seq: seat.seq } as Chatroom.SeatContent
    }
    this.mqClient.sendMsg(`_room/${seat.roomId}`, JSON.stringify([msg]))
    return 'success'
  }

  async sendMsg(roomId: string, msg: Chatroom.Message, token: string) {
    let profile = await this.userService.getUserInfoByToken(token)
    msg.from = profile.uid;
    (msg.data as Chatroom.ChatContent).name = profile.name;
    (msg.data as Chatroom.ChatContent).avatar = profile.avatar;
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