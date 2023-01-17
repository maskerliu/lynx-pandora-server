import { UploadedFile } from 'express-fileupload'
import { Autowired, BizContext, BodyParam, Controller, FileParam, Get, Post, QueryParam } from 'lynx-express-mvc'
import { IM, RemoteAPI } from '../models'
import IMService from '../service/im.service'


@Controller(RemoteAPI.IM.BasePath)
export default class IMController {


  @Autowired()
  imService: IMService

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

}