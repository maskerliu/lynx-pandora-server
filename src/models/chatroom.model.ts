import { Common, User } from '.'

export namespace Chatroom {

  export enum RoomTypeEnum {
    DianTai,
    JiaoYou,
    YuLe,
  }
  export interface RoomType {
    [RoomTypeEnum.DianTai]: {
      type: 1,
      desc: '电台'
    }

    [RoomTypeEnum.JiaoYou]: {
      type: 2,
      desc: '交友'
    }
    [RoomTypeEnum.YuLe]: {
      type: 3,
      desc: '娱乐'
    }
  }


  export interface Channel {

  }

  export interface RoomTag extends Common.DBDoc {
    title: string
  }

  export interface Room extends Common.DBDoc {
    title?: string
    cover?: string
    frame?: string
    owner?: string
    notice?: string
    background?: string
    type?: RoomType[RoomTypeEnum]
    tags?: Array<string>
    seats?: Array<Seat>
  }

  export enum SeatType {
    Admin, // 房主
    Master, // 管理
    Guest, // 嘉宾
  }

  export interface Seat extends Common.DBDoc {
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

  export enum MsgType {
    ChatText = 1000, // 文字聊天消息
    ChatEmoji = 1001, // 表情聊天消息
    Enter = 2001, // 进入房间
    Exit = 2009, // 离开房间
    Reward = 3000, // 打赏
    Sys = 6000, // 系统消息
  }

  export interface ChatContent {
    uid: string
    content: string
  }

  export interface RewardContent {
    to: string
    giftId: string
    count: number
  }

  export interface SysInfoContent {
    data: string
  }

  export interface EnterContent {
    uid: string
    effect: string
  }

  export interface Message extends Common.DBDoc {
    type: MsgType
    from?: string
    content?: ChatContent | RewardContent | SysInfoContent | EnterContent
  }
}