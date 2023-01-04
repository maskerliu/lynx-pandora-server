import { UploadedFile } from 'express-fileupload'
import { Autowired, BizContext, BodyParam, Controller, FileParam, Get, Post, QueryParam } from 'lynx-express-mvc'
import { Chatroom, RemoteAPI } from '../models'
import { ChatroomService } from '../service/chatroom.service'

@Controller(RemoteAPI.Chatroom.BasePath)
export class ChatroomController {

  @Autowired()
  chatroomService: ChatroomService

  
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
    return await this.chatroomService.getEmojiGroups(roomId)
  }

  @Get(RemoteAPI.Chatroom.SeatRequests)
  async seatRequests(@QueryParam('roomId') roomId: string) {
    return await this.chatroomService.seatRequests(roomId)
  }

  @Post(RemoteAPI.Chatroom.SeatReq)
  async seatOpt(@BodyParam() data: { roomId: string, seq: number, code: Chatroom.MsgType }, context: BizContext) {
    return await this.chatroomService.seatReq(data.roomId, data.seq, data.code, context.token)
  }

  @Post(RemoteAPI.Chatroom.SeatMgr)
  async seatOnAllow(@BodyParam() data: { roomId: string, uid: string, seq: number, code: Chatroom.MsgType }, context: BizContext) {
    return await this.chatroomService.seatMgr(data.roomId, data.seq, data.uid, data.code, context.token)
  }

  @Get(RemoteAPI.Chatroom.Gifts)
  async getGiftInfo(@QueryParam('roomId') rid: string) {
    return await this.chatroomService.getGiftInfo(rid)
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
  async reward(@BodyParam() rewardInfo: { roomId: string, giftId: string, count: number, receivers: string[] }, context: BizContext) {
    return await this.chatroomService.reward(rewardInfo.roomId, rewardInfo.giftId, rewardInfo.count, rewardInfo.receivers, context.token)
  }

  @Post(RemoteAPI.Chatroom.SendMsg)
  async sendMessage(@QueryParam('roomId') roomId: string, @BodyParam('msg') msg: Chatroom.Message, context: BizContext) {
    return await this.chatroomService.sendMsg(roomId, msg, context.token)
  }
}