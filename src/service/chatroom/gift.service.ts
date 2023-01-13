import { Autowired, Service } from 'lynx-express-mvc'
import { Chatroom } from '../../models'
import { GiftOrderRepo, GiftRepo, RewardRecordRepo } from '../../repository/chatroom.repo'
import { PaymentService } from '../payment.service'
import BasicGifts from './data/gift.basic.json'
import VIPGifts from './data/gift.vip.json'

@Service()
export class GiftService {

  @Autowired()
  private giftRepo: GiftRepo

  @Autowired()
  private giftOrderRepo: GiftOrderRepo

  @Autowired()
  private rewardRecordRepo: RewardRecordRepo

  @Autowired()
  private paymentService: PaymentService

  async init() {
    // await this.importData()
  }

  async getGifts(roomId: string) {
    return await this.giftRepo.getGifts(roomId, Chatroom.GiftType.Normal)
  }

  async buyGift(uid: string, giftId: string, count: number, receivers: Array<string>) {
    let gift = await this.giftRepo.get('_id', giftId)
    let diamonds = gift.price * count * receivers.length
    let payId = await this.paymentService.consume(diamonds, uid)

    let order: Chatroom.GiftOrder = {
      uid, giftId, count, payId,
      timestamp: new Date().getTime()
    }

    let orderId = await this.giftOrderRepo.addOrder(order)
    let purseRecords = receivers.map(it => { return { uid: it, purse: gift.price } })
    let purseIds = await this.paymentService.bulkUpdatePurse(purseRecords)

    let rewardRecords: Array<Chatroom.RewardRecord> = []
    for (let i = 0; i < receivers.length; ++i) {
      rewardRecords.push({
        from: uid,
        to: receivers[i],
        count, giftId,
        giftOrderId: orderId,
        purseId: purseIds[i],
        timestamp: new Date().getTime()
      })
    }
    receivers.forEach(it => {
      let giftOrderId = ''
      let purseId = ''
      rewardRecords.push({
        from: uid, to: it, count, giftId,
        giftOrderId, purseId,
        timestamp: new Date().getTime()
      })
      purseRecords.push({ uid: it, purse: gift.price })
    })

    await this.rewardRecordRepo.addRecords(rewardRecords)


    return gift
  }


  private async importData() {
    await this.giftRepo.importData(BasicGifts)
  }

  async getBasicGifts() {
    return BasicGifts as Array<Chatroom.Gift>
  }

  async getVIPGifs() {
    return VIPGifts as Array<Chatroom.Gift>
  }

}