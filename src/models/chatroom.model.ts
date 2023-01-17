import { Common, User } from '.'

export namespace Chatroom {

  export enum RoomType {
    DianTai, // 2 seats
    JiaoYou, // 4 seats
    YuLe, // 8 seat
  }

  export enum RoomStatus {
    Verifing, // 认证中
    Open, // 开放中
    Private, // 私密
    Close, // 关闭
  }

  export interface RoomTag extends Common.DBDoc {
    title: string
  }

  export interface Room extends Common.DBDoc {
    title?: string
    cover?: string
    frame?: string
    owner: string
    ownerName?: string
    status?: RoomStatus
    isStared?: boolean
    notice?: string
    welcome?: string
    background?: string
    type?: RoomType
    tags?: Array<string>
    seats?: Array<Seat>
    masters?: Array<string>
    displayMasters?: Array<User.Profile>
  }

  export interface UserPropInfo {
    seatFrame?: string
    msgFrame?: string
    enterEffect?: string
  }

  // 上麦请求
  export interface SeatReq extends Common.DBDoc {
    uid: string
    roomId: string
    seatSeq: number // 麦位
    timestamp?: number
  }

  export enum SeatType {
    Admin, // 房主
    Master, // 管理
    Host, // 主持
    Guard, // 守护者
    Guest, // 嘉宾
  }

  export interface Seat extends Common.DBDoc {
    roomId?: string
    defName?: string
    seq: number // 麦序
    type: SeatType
    isMute: boolean // 是否闭麦
    isLocked: boolean
    userInfo?: User.Profile & UserPropInfo
  }

  export interface RoomCollection extends Common.DBDoc {
    uid: string
    roomId: string
    timestamp: number
  }

  export enum MsgType {
    ChatText = 1000, // 文字聊天消息
    ChatEmoji = 1001, // 表情聊天消息
    Enter = 2001, // 进入房间
    Exit = 2009, // 离开房间
    Reward = 3000, // 打赏
    SeatOnReq = 4001, // 排麦
    SeatOnReqCancel = 4002, // 取消排麦
    SeatOn = 4003, // 上麦
    SeatDown = 4004, // 下麦
    SeatMute = 4005, // 闭麦
    SeatUnmute = 4006, // 开麦
    SeatLock = 4007, // 锁住座位
    SeatUnlock = 4008, // 开放座位
    Sys = 6000, // 系统消息
  }

  export interface Message extends Common.DBDoc {
    type: MsgType
    userInfo?: User.Profile & UserPropInfo
    content?: string
    seq?: number
    giftId?: string
    count?: number
  }

  export enum GiftType {
    Normal,
    VIP,
  }

  export enum GiftStatus {
    On,
    Off
  }

  export interface Gift extends Common.DBDoc {
    title: string
    snap: string
    effect?: string
    price: number
    type: GiftType
    status?: GiftStatus
  }

  export interface EmojiGroup {
    name: string
    emojis: Array<Emoji>
  }

  export enum EmojiType {
    Tool,
    Basic,
    VIP,
  }

  export enum EmojiStatus {
    On,
    Off
  }

  export interface Emoji extends Common.DBDoc {
    name: string
    snap: string
    gif: string
    type: EmojiType
    status: EmojiStatus
  }

  export enum PropType {
    SeatFrame,
    EnterEffect,
    MsgFrame
  }

  export enum PropStatus {
    On,
    Off
  }

  export interface Prop extends Common.DBDoc {
    type: PropType
    name: string
    snap: string
    effect: string
    price: number
    status: PropStatus
    expired: number
  }

  export interface PropGroup {
    title: string
    props: Array<Prop>
  }

  export interface RewardRecord extends Common.DBDoc {
    from: string
    to: string
    giftOrderId: string
    purseId: string
    giftId: string
    count: number
    timestamp: number
  }

  export interface GiftOrder extends Common.DBDoc {
    uid: string
    giftId: string
    gift?: Gift
    count: number
    payId: string // 支付订单号
    timestamp: number
    expired?: number
  }

  export enum PropOrderStatus {
    On, // 道具生效中
    Off, // 道具未应用
  }

  export interface PropOrder extends Common.DBDoc {
    uid: string
    propId: string
    prop?: Prop
    count: number
    status: PropOrderStatus
    payId: string // 支付订单号
    timestamp: number
    expired: number // 失效时间
  }
}