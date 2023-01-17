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
    let props = await this.propRepo.getProps(Chatroom.PropType.SeatFrame)
    props.forEach(it => { delete it._rev })
    let seatFrameProps: Chatroom.PropGroup = { title: '座位框', props }
    props = await this.propRepo.getProps(Chatroom.PropType.MsgFrame)
    props.forEach(it => { delete it._rev })
    let msgFrameProps: Chatroom.PropGroup = { title: '消息背景', props }
    props = await this.propRepo.getProps(Chatroom.PropType.EnterEffect)
    props.forEach(it => { delete it._rev })
    let enterEffectProps: Chatroom.PropGroup = { title: '入场特效', props }

    return [seatFrameProps, enterEffectProps, msgFrameProps]
  }

  async getMyProps(token: string) {
    let uid = await this.userService.token2uid(token)
    let groups = await this.getUserPropOrders(uid)
    groups.forEach(group => {
      group.orders.forEach(it => {
        delete it._rev
      })
    })

    return groups
  }

  async getUserPropOrders(uid: string) {
    let propOrders = await this.propOrderRepo.getUserVaildPropOrder(uid)
    let ids = propOrders.map(it => { return { id: it.propId } })
    if (ids.length == 0) return []

    let props = await this.propRepo.bulkGet(ids)
    let orders = propOrders.map(it => {
      it.prop = props.find(p => { return p._id == it.propId })
      return it
    })

    let seatFrameOrders = [], msgFrameOrders = [], enterEffectOrders = []
    orders.forEach(it => {
      switch (it.prop.type) {
        case Chatroom.PropType.SeatFrame:
          seatFrameOrders.push(it)
          break
        case Chatroom.PropType.MsgFrame:
          msgFrameOrders.push(it)
          break
        case Chatroom.PropType.EnterEffect:
          enterEffectOrders.push(it)
          break
      }
    })

    return [
      { title: '座位框', orders: seatFrameOrders },
      { title: '消息背景', orders: msgFrameOrders },
      { title: '入场特效', orders: enterEffectOrders }
    ] as Array<{ title: string, orders: Array<Chatroom.PropOrder> }>
  }

  async getUserUsingProps(uid: string) {
    let usingOrders = await this.propOrderRepo.getUserUsingProps(uid)
    let propIds = usingOrders.map(it => { return { id: it.propId } })
    if (propIds.length == 0) return [] as Chatroom.UserPropInfo

    let props = await this.propRepo.bulkGet(propIds)

    let seatFrame = null, msgFrame = null, enterEffect = null
    props.forEach(it => {
      switch (it.type) {
        case Chatroom.PropType.SeatFrame:
          seatFrame = it.snap
          break
        case Chatroom.PropType.MsgFrame:
          msgFrame = it.effect
          break
        case Chatroom.PropType.EnterEffect:
          enterEffect = it.snap
          break
      }
    })

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

    return await this.propOrderRepo.add(propOrder)
  }

  async updateOrderStatus(orderId: string, propId: string, status: Chatroom.PropOrderStatus, type: Chatroom.PropType, token: string) {
    let uid = await this.userService.token2uid(token)
    let order = await this.propOrderRepo.get('_id', orderId)
    if (order.propId != propId || uid == null || order.expired < new Date().getTime()) throw 'info error'

    let orders = []
    order.status = status
    orders.push(order)

    if (status == Chatroom.PropOrderStatus.On) {
      let groups = await this.getUserPropOrders(uid)

      let i = 0;
      for (i = 0; i < groups.length; ++i) {
        if (groups[i].orders[0].prop.type == type) break
      }
      let needUpdates = groups[i].orders.filter(it => { return it.status == Chatroom.PropOrderStatus.On })
      needUpdates.forEach(it => {
        delete it.prop
        it.status = Chatroom.PropOrderStatus.Off
      })
      orders.push(...needUpdates)
    }

    await this.propOrderRepo.bulkDocs(orders)

    return await this.getUserUsingProps(uid)
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