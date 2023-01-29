import { Autowired, BizCode, BizFail, Service } from 'lynx-express-mvc'
import { IM } from '../models'
import { RedPacketOrderRepo, RedPacketRepo } from '../repository/im.repo'
import IMService from './im.service'
import { PaymentService } from './payment.service'
import UserService from './user.service'


@Service()
export class RedPacketService {

  @Autowired()
  private userService: UserService

  @Autowired()
  private paymentService: PaymentService

  @Autowired()
  private imService: IMService

  @Autowired()
  redpacketRepo: RedPacketRepo

  @Autowired()
  redpacketOrderRepo: RedPacketOrderRepo

  async create(order: IM.RedPacketOrder, token: string) {
    let uid = await this.userService.token2uid(token)
    let profile = await this.userService.getUserInfo(uid)
    let payId = await this.paymentService.consume(order.amount, uid, '红包')

    order.name = `来自${profile.name}的红包`
    order.uid = uid
    order.payId = payId
    order.timestamp = new Date().getTime()

    let orderId = await this.redpacketOrderRepo.add(order)
    order._id = orderId
    let redpackets = this.genRedPacket(order.amount, order.count, orderId, order.type)
    await this.redpacketRepo.bulkDocs(redpackets)

    let msg: IM.Message = {
      sid: order.sid,
      uid,
      timestamp: new Date().getTime(),
      type: IM.MessageType.RedPacket,
      sent: true,
      read: false,
      content: order
    }

    return await this.imService.send(msg, token)
  }

  async redpacketOrder(orderId: string) {
    let order = await this.redpacketOrderRepo.get('_id', orderId)
    delete order._rev
    order.timestamp
    return order
  }

  async claim(orderId: string, token: string) {
    let uid = await this.userService.token2uid(token)
    let profile = await this.userService.getUserInfo(uid)

    let packets = await this.redpacketRepo.getRedPackets(orderId, IM.RedPacketStatus.Unclaimed)
    if (packets.length == 0) throw new BizFail(BizCode.FAIL, '手速慢了一点，红包已被抢光啦')

    let seed = Math.floor(Math.random() * packets.length)
    let packet = packets[seed]
    packet.uid = uid
    packet.name = profile.name
    packet.avatar = profile.avatar
    packet.updateTime = new Date().getTime()
    packet.status = IM.RedPacketStatus.WrittenOff
    await this.redpacketRepo.save(packet)

    await this.paymentService.income(packet.amount, uid)
    return this.claimedRedPackets(orderId)
  }

  async claimedRedPackets(orderId: string) {
    let packets = await this.redpacketRepo.getRedPackets(orderId, IM.RedPacketStatus.WrittenOff)
    packets.forEach(it => { delete it._rev })
    return packets
  }

  private genRedPacket(amount: number, count: number, orderId: string, type: IM.RedPacketType) {

    let packets: Array<IM.RedPacket> = []
    let timestamp = new Date().getTime()
    switch (type) {
      case IM.RedPacketType.Quota:
        let packet: IM.RedPacket = {
          orderId,
          amount: amount,
          status: IM.RedPacketStatus.Unclaimed,
          createTime: timestamp,
          updateTime: timestamp,
        }

        for (let i = 0; i < count; ++i) {
          packets.push(packet)
        }
        break
      case IM.RedPacketType.Random:
        // TODO
        break
    }

    return packets
  }
}