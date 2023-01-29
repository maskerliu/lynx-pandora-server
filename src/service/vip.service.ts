import { Autowired, BizCode, BizFail, Service } from 'lynx-express-mvc'
import { User } from '../models'
import { VIPItemRepo, VIPOrderRepo } from '../repository/vip.repo'
import { PaymentService } from './payment.service'
import UserService from './user.service'

@Service()
export class VIPService {

  @Autowired()
  private userService: UserService

  @Autowired()
  private paymentService: PaymentService

  @Autowired()
  private vipItemRepo: VIPItemRepo

  @Autowired()
  private vipOrderRepo: VIPOrderRepo

  async init() {
    // await this.vipItemRepo.importData(VIPItems)
  }

  async config() {
    return await this.vipItemRepo.getAllVaildItems()
  }

  async myVIP(token: string) {
    let uid = await this.userService.token2uid(token)
    let order = await this.vipOrderRepo.getUserVaildOrder(uid)
    if (order != null) {
      delete order._rev
      delete order.uid
      delete order._id
    }

    return order
  }


  async buy(vipId: string, token: string) {

    let uid = await this.userService.token2uid(token)
    let existedOrder = await this.vipOrderRepo.getUserVaildOrder(uid)
    if (existedOrder && existedOrder.vipId == vipId) throw new BizFail(BizCode.FAIL, '您的会员仍在有效期，请到期后再续费')

    let vipItem = await this.vipItemRepo.get('_id', vipId)
    let payId = await this.paymentService.consume(vipItem.price, uid, '购买会员')

    let timestamp = new Date().getTime()
    let vipOrder: User.VIPOrder = {
      uid, vipId, payId, timestamp, type: vipItem.type,
      expired: timestamp + vipItem.expired * 24 * 60 * 60 * 1000
    }

    await this.vipOrderRepo.add(vipOrder)
    return vipOrder
  }
}