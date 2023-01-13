import { UploadedFile } from 'express-fileupload'
import { Autowired, BizContext, BodyParam, Controller, FileParam, Get, Post, QueryParam } from 'lynx-express-mvc'
import { Chatroom, RemoteAPI } from '../models'
import { ChatroomService } from '../service/chatroom/chatroom.service'
import { EmojiService } from '../service/chatroom/emoji.service'
import { GiftService } from '../service/chatroom/gift.service'
import { PropService } from '../service/chatroom/prop.service'

type SeatReq = {
  roomId: string,
  uid?: string,
  seq: number,
  code: Chatroom.MsgType
}

type UsePropReq = {
  orderId: string,
  propId: string,
  status: Chatroom.PropOrderStatus
}

type RewardReq = {
  roomId: string,
  giftId: string,
  count: number,
  receivers: string[]
}

@Controller(RemoteAPI.Chatroom.BasePath)
export class ChatroomController {

  @Autowired()
  chatroomService: ChatroomService

  @Autowired()
  propService: PropService

  @Autowired()
  giftService: GiftService

  @Autowired()
  emojiService: EmojiService


  @Get(RemoteAPI.Chatroom.MyRooms)
  async myRooms(context: BizContext) {
    return await this.chatroomService.getMyRooms(context.token)
  }

  @Get(RemoteAPI.Chatroom.RoomInfo)
  async getRoomInfo(@QueryParam('roomId') roomId: string) {
    return await this.chatroomService.getRoomInfo(roomId)
  }

  @Get(RemoteAPI.Chatroom.Emojis)
  async getRoomEmojis(@QueryParam('roomId') roomId: string) {
    return await this.emojiService.getEmojis(roomId)
  }

  @Get(RemoteAPI.Chatroom.SeatRequests)
  async seatRequests(@QueryParam('roomId') roomId: string) {
    return await this.chatroomService.seatRequests(roomId)
  }

  @Post(RemoteAPI.Chatroom.SeatReq)
  async seatOpt(@BodyParam() data: SeatReq, context: BizContext) {
    return await this.chatroomService.seatReq(data.roomId, data.seq, data.code, context.token)
  }

  @Post(RemoteAPI.Chatroom.SeatMgr)
  async seatOnAllow(@BodyParam() data: SeatReq, context: BizContext) {
    return await this.chatroomService.seatMgr(data.roomId, data.seq, data.uid, data.code, context.token)
  }

  @Get(RemoteAPI.Chatroom.Gifts)
  async getGiftInfo(@QueryParam('roomId') roomId: string) {
    return await this.giftService.getGifts(roomId)
  }

  @Get(RemoteAPI.Chatroom.PropStore)
  async getPropStore() {
    return await this.propService.getPropStore()
  }

  @Post(RemoteAPI.Chatroom.BuyProp)
  async buyProp(@BodyParam() data: { propId: string, count: number }, context: BizContext) {
    return await this.propService.buyProp(data.propId, data.count, context.token)
  }

  @Post(RemoteAPI.Chatroom.UseProp)
  async useProp(@BodyParam() data: UsePropReq, context: BizContext) {
    return await this.propService.updateOrderStatus(data.orderId, data.propId, data.status, context.token)
  }

  @Get(RemoteAPI.Chatroom.MyProps)
  async getMyProps(context: BizContext) {
    return await this.propService.getMyProps(context.token)
  }

  @Post(RemoteAPI.Chatroom.Enter)
  async enterRoom(@BodyParam() data: { roomId: string }, context: BizContext) {
    return await this.chatroomService.enter(data.roomId, context.token)
  }

  @Post(RemoteAPI.Chatroom.Leave)
  async leaveRoom(@BodyParam() data: { roomId: string }, context: BizContext) {
    return await this.chatroomService.leave(data.roomId, context.token)
  }

  @Post(RemoteAPI.Chatroom.RoomSave)
  async saveRoom(@BodyParam('room') room: Chatroom.Room, @FileParam('cover') cover: UploadedFile, context: BizContext) {
    return await this.chatroomService.save(room, cover, context.token)
  }

  @Get(RemoteAPI.Chatroom.Collect)
  async collectRoom(@QueryParam('roomId') roomId: string, context: BizContext) {
    return await this.chatroomService.collectRoom(roomId, context.token)
  }

  @Post(RemoteAPI.Chatroom.Reward)
  async reward(@BodyParam() rewardInfo: RewardReq, context: BizContext) {
    return await this.chatroomService.reward(rewardInfo.roomId, rewardInfo.giftId, rewardInfo.count, rewardInfo.receivers, context.token)
  }

  @Post(RemoteAPI.Chatroom.SendMsg)
  async sendMessage(@QueryParam('roomId') roomId: string, @BodyParam('msg') msg: Chatroom.Message, context: BizContext) {
    return await this.chatroomService.sendMsg(roomId, msg, context.token)
  }
}