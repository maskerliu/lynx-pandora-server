import { Autowired, Service } from 'lynx-express-mvc'
import { Chatroom } from '../../models'
import { PropOrderRepo, PropRepo } from '../../repository/chatroom.repo'
import { PaymentService } from '../payment.service'
import UserService from '../user.service'
import EnterEffectProps from './data/prop.entereffect.json'
import MsgFrameProps from './data/prop.msgframe.json'
import SeatFrameProps from './data/prop.seatframe.json'

const ONE_DAY = 24 * 60 * 60 * 1000

@Service()
export class PropService {

  @Autowired()
  private userService: UserService

  @Autowired()
  private paymentService: PaymentService

  @Autowired()
  private propRepo: PropRepo

  @Autowired()
  private propOrderRepo: PropOrderRepo

  async init() {
    // await this.importData()
  }

  async importData() {
    let props = [...SeatFrameProps, ...MsgFrameProps, ...EnterEffectProps] as Array<Chatroom.Prop>
    await this.propRepo.importData(props)
  }

  async getPropStore() {
    let seatFrameProps: Chatroom.PropGroup = { title: '座位框', props: await this.propRepo.getProps(Chatroom.PropType.SeatFrame) }
    let msgFrameProps: Chatroom.PropGroup = { title: '消息背景', props: await this.propRepo.getProps(Chatroom.PropType.MsgFrame) }
    let enterEffectProps: Chatroom.PropGroup = { title: '入场特效', props: await this.propRepo.getProps(Chatroom.PropType.EnterEffect) }

    return [seatFrameProps, enterEffectProps, msgFrameProps]
  }

  async getMyProps(token: string) {
    let uid = await this.userService.token2uid(token)
    return await this.getUserProps(uid)
  }

  async getUserProps(uid: string) {
    let propOrders = await this.propOrderRepo.getUserVaildPropOrder(uid)
    let ids = propOrders.map(it => { return { id: it.propId } })
    if (ids.length == 0) return []

    let props = await this.propRepo.bulkProps(ids)
    let orders = propOrders.map(it => {
      delete it._rev
      it.prop = props.find(p => { return p._id == it.propId })
      return it
    })

    let seatFrameOrders = {
      title: '座位框',
      orders: orders.filter(it => { return it.prop.type == Chatroom.PropType.SeatFrame })
    }
    let msgFrameOrders = {
      title: '消息背景',
      orders: orders.filter(it => { return it.prop.type == Chatroom.PropType.MsgFrame })
    }
    let enterEffectOrders = {
      title: '入场特效',
      orders: orders.filter(it => { return it.prop.type == Chatroom.PropType.EnterEffect })
    }

    return [seatFrameOrders, msgFrameOrders, enterEffectOrders]
  }

  async getUserUsingProps(uid: string) {
    let usingOrders = await this.propOrderRepo.getUserUsingProps(uid)
    let propIds = usingOrders.map(it => { return { id: it.propId } })
    if (propIds.length == 0) return [] as Chatroom.UserPropInfo

    let props = await this.propRepo.bulkProps(propIds)

    let seatFrame = props.find(it => { return it.type == Chatroom.PropType.SeatFrame })?.snap
    let msgFrame = props.find(it => { return it.type == Chatroom.PropType.MsgFrame })?.effect
    let enterEffect = props.find(it => { return it.type == Chatroom.PropType.EnterEffect })?.snap

    return { seatFrame, msgFrame, enterEffect } as Chatroom.UserPropInfo
  }

  async buyProp(propId: string, count: number, token: string) {
    let uid = await this.userService.token2uid(token)
    let isExisted = await this.propOrderRepo.orderExisted(propId, uid)
    if (isExisted) throw '已购买该道具，可在我的道具中使用'

    let prop = await this.propRepo.get("_id", propId)
    let diamonds = prop.price * count
    let payId = await this.paymentService.consume(diamonds, uid)
    let timestamp = new Date().getTime()
    let expired = timestamp + prop.expired * ONE_DAY
    let propOrder: Chatroom.PropOrder = {
      uid, propId, count, payId, timestamp, expired,
      status: Chatroom.PropOrderStatus.Off
    }

    return await this.propOrderRepo.addOrder(propOrder)
  }

  async updateOrderStatus(orderId: string, propId: string, status: Chatroom.PropOrderStatus, token: string) {
    let uid = await this.userService.token2uid(token)
    let order = await this.propOrderRepo.get('_id', orderId)
    if (order.propId != propId || uid == null || order.expired < new Date().getTime()) throw 'info error'

    order.status = status
    return await this.propOrderRepo.saveOrder(order)
  }


  private async getSeatFrameProps() {
    let props = SeatFrameProps as Array<Chatroom.Prop>

    props.forEach(it => {
      it.type = Chatroom.PropType.SeatFrame
    })
    return props
  }

  private async getMsgFrameProps() {
    let props = MsgFrameProps as Array<Chatroom.Prop>
    props.forEach(it => {
      it.type = Chatroom.PropType.MsgFrame
    })
    return props
  }

  private async getEnterEffectProps() {
    let props = EnterEffectProps as Array<Chatroom.Prop>
    props.forEach(it => {
      it.type = Chatroom.PropType.EnterEffect
    })
    return props
  }

}