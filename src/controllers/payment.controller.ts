import { Autowired, BizContext, BodyParam, Controller, Get, Post, QueryParam } from 'lynx-express-mvc'
import { RemoteAPI } from '../models'
import { PaymentService } from '../service/payment.service'


@Controller(RemoteAPI.Payment.BasePath)
export class PaymentController {

  @Autowired()
  paymentService: PaymentService

  @Get(RemoteAPI.Payment.MyWallet)
  async myWallet(context: BizContext) {
    return await this.paymentService.myWallet(context.token)
  }

  @Get(RemoteAPI.Payment.RechargeConfig)
  async rechargeConfig(context: BizContext) {
    return await this.paymentService.rechargeConfig(context.token)
  }

  @Post(RemoteAPI.Payment.Recharge)
  async recharge(@BodyParam() data: { purchaseId: string, channel: string }, context: BizContext) {
    return await this.paymentService.recharge(data.purchaseId, data.channel, context.token)
  }

  @Get(RemoteAPI.Payment.ExchangeConfig)
  async exchangeConfig(context: BizContext) {
    return await this.paymentService.exchangeConfig(context.token)
  }

  @Post(RemoteAPI.Payment.Exchange)
  async exchange(@BodyParam() req: { purchaseId: string }, context: BizContext) {
    return await this.paymentService.exchange(req.purchaseId, context.token)
  }

  @Get(RemoteAPI.Payment.PurseRecords)
  async purseRecords(@QueryParam('page') page: number, context: BizContext) {
    return await this.paymentService.getPagedOrders(page, context.token)
  }
}