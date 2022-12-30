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
    owner?: string
    ownerName?: string
    status?: RoomStatus
    isStared?: boolean
    notice?: string
    background?: string
    type?: RoomType
    tags?: Array<string>
    seats?: Array<Seat>
    masters?: Array<string>
    displayMasters?: Array<User.Profile>
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
    seq: number // 麦序
    type: SeatType
    isMute: boolean // 是否闭麦
    isLocked: boolean
    userInfo?: User.Profile
  }

  export interface Gift extends Common.DBDoc {
    title: string
    snap: string
    effect?: string
    priceDesc: string
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
    SeatReq = 4001, // 排麦
    SeatReqCancel = 4002, // 取消排麦
    SeatOn = 4003, // 上麦
    SeatDown = 4004, // 下麦
    SeatMute = 4005, // 闭麦
    SeatLock = 4006, // 上锁
    Sys = 6000, // 系统消息
  }

  export interface ChatContent {
    name: string
    avatar: string
    content: string
  }

  export interface RewardContent {
    to: string
    giftId: string
    count: number
  }

  export interface SysInfoContent {
    content: string
  }

  export interface EnterContent {
    uid: string
    effect: string
  }

  export interface SeatContent {
    uid: string
    seq: number
  }

  export interface Message extends Common.DBDoc {
    type: MsgType
    from?: string
    data?: ChatContent | RewardContent | SysInfoContent | EnterContent | SeatContent
  }

  export interface EmojiGroup {
    name: string
    emojis: Array<Emoji>
  }

  export interface Emoji {
    name: string
    snap: string
    gif: string
  }
}