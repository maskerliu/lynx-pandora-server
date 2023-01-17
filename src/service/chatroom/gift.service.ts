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

  async getGifts(roomId: string, type: Chatroom.GiftType) {
    let result = await this.giftRepo.getGifts(roomId, type)
    result.forEach(it => {
      delete it._rev
    })

    
    return result
  }

  async buyGift(uid: string, giftId: string, count: number, receivers: Array<string>) {
    let gift = await this.giftRepo.get('_id', giftId)
    let diamonds = gift.price * count * receivers.length
    let payId = await this.paymentService.consume(diamonds, uid)

    let order: Chatroom.GiftOrder = {
      uid, giftId, count, payId,
      timestamp: new Date().getTime()
    }

    let orderId = await this.giftOrderRepo.add(order)
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

    await this.rewardRecordRepo.bulkDocs(rewardRecords)

    return gift
  }


  private async importData() {
    let gifts = [...BasicGifts, ...VIPGifts]
    await this.giftRepo.importData(gifts)
  }

}