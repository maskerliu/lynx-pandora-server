import { Autowired, BizContext, Controller, Get, Post, QueryParam } from 'lynx-express-mvc'
import { RemoteAPI } from '../models'
import { VIPService } from '../service/vip.service'


@Controller(RemoteAPI.VIP.BasePath)
export class VIPController {

  @Autowired()
  private vipService: VIPService

  @Get(RemoteAPI.VIP.Config)
  async vipConfig() {
    return await this.vipService.config()
  }

  @Get(RemoteAPI.VIP.MyVIP)
  async myVIP(context: BizContext) {
    return await this.vipService.myVIP(context.token)
  }

  @Post(RemoteAPI.VIP.Buy)
  async bug(@QueryParam('vipId') vipId: string, context: BizContext) {
    return await this.vipService.buy(vipId, context.token)
  }
}