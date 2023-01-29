import { UploadedFile } from 'express-fileupload'
import { Autowired, BizContext, BodyParam, Controller, FileParam, Get, Post, QueryParam } from 'lynx-express-mvc'
import { IM, RemoteAPI } from '../models'
import IMService from '../service/im.service'
import { RedPacketService } from '../service/redpacket.service'


@Controller(RemoteAPI.IM.BasePath)
export default class IMController {

  @Autowired()
  private imService: IMService

  @Autowired()
  private redpacketService: RedPacketService

  @Get(RemoteAPI.IM.MyEmojis)
  async myEmojis(context: BizContext) {
    return await this.imService.getMyEmojis(context.token)
  }

  @Post(RemoteAPI.IM.EmojiAdd)
  async addEmoji(@BodyParam('file') file: UploadedFile, context: BizContext) {
    return await this.imService.addEmoji(file, context.token)
  }

  @Post(RemoteAPI.IM.EmojiDel)
  async delEmoji(@QueryParam('eid') eid: string, context: BizContext) {
    return await this.imService.deleteEmoji(eid, context.token)
  }

  @Get(RemoteAPI.IM.SyncFrom)
  async syncFrom(@QueryParam('sid') sid: string) {
    return await this.imService.getSession(sid)
  }

  @Post(RemoteAPI.IM.BulkSyncFrom)
  async bulkSyncFrom(@BodyParam() sids: Array<string>) {
    return await this.imService.getSessions(sids)
  }

  @Get(RemoteAPI.IM.GetOfflineMessages)
  async getOfflineMessages(context: BizContext) {
    return await this.imService.getOfflineMessages(context.token)
  }

  @Post(RemoteAPI.IM.SyncTo)
  async syncTo(@BodyParam('session') session: IM.Session, @FileParam('thumb') thumb?: UploadedFile) {
    return await this.imService.saveSession(session, thumb)
  }

  @Post(RemoteAPI.IM.SendMsg)
  async sendMsg(@BodyParam('message') message: IM.Message, @FileParam('file') file: UploadedFile, context: BizContext) {
    return await this.imService.send(message, context.token, file)
  }

  @Post(RemoteAPI.IM.CreateRedPacket)
  async createRedPacket(@BodyParam() order: IM.RedPacketOrder, context: BizContext) {
    return this.redpacketService.create(order, context.token)
  }

  @Get(RemoteAPI.IM.ClaimRedPacket)
  async claimRedPacket(@QueryParam('orderId') orderId: string, context: BizContext) {
    return this.redpacketService.claim(orderId, context.token)
  }

  @Get(RemoteAPI.IM.ClaimedRedPackets)
  async claimedRedPackets(@QueryParam('orderId') orderId: string) {
    return this.redpacketService.claimedRedPackets(orderId)
  }
}