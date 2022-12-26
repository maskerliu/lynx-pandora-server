import { Autowired, BizContext, BodyParam, Controller, Get, Post, QueryParam } from 'lynx-express-mvc'
import { Chatroom, RemoteAPI } from '../models'
import { ChatRoomService } from '../service/chatroom.service'

@Controller(RemoteAPI.Chatroom.BasePath)
export class ChatRoomController {

  @Autowired()
  chatroomService: ChatRoomService

  @Get(RemoteAPI.Chatroom.MyCollections)
  async myCollections(context: BizContext) {
    return await this.chatroomService.getMyCollections(context.token)
  }

  @Get(RemoteAPI.Chatroom.Recommend)
  async recommends(context: BizContext) {
    return await this.chatroomService.getRecommend(context.token)
  }

  @Get(RemoteAPI.Chatroom.RoomInfo)
  async getRoomInfo(@QueryParam('rid') rid: string) {
    return await this.chatroomService.getRoomInfo(rid)
  }

  @Get(RemoteAPI.Chatroom.Gifts)
  async getGiftInfo(@QueryParam('rid') rid: string) {
    return await this.chatroomService.getGiftInfo(rid)
  }

  @Post(RemoteAPI.Chatroom.Enter)
  async enterRoom(@BodyParam() data: { roomId: string }, context: BizContext) {
    return await this.chatroomService.enter(data.roomId, context.token)
  }

  @Post(RemoteAPI.Chatroom.RoomSave)
  async saveRoom(@BodyParam('room') room: Chatroom.Room) {
    return null
  }

  @Post(RemoteAPI.Chatroom.Reward)
  async reward(@BodyParam() rewardInfo: { roomId: string, giftId: string, count: number, receivers: string[] }, context: BizContext) {
    return await this.chatroomService.reward(rewardInfo.roomId, rewardInfo.giftId, rewardInfo.count, rewardInfo.receivers, context.token)
  }

}