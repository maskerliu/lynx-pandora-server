import { Common } from '.'

export namespace IM {

  export enum SessionType {
    P2P, // 单聊
    GROUP, // 群组
    SYSTEM // 系统
  }

  export interface Session extends Common.DBDoc {
    sid: string
    type: SessionType
    title?: string
    thumb?: string
    snapshot?: string
    members: Array<string>
    timestamp?: number
    unread?: number // 未读消息数
    notice?: string
    pinned?: number // 是否置顶
  }

  export interface IMEmoji extends Common.DBDoc {
    uid: string
    name?: string
    snap: string
    gif?: string
    timestamp: number
  }

  export enum MessageType {
    TEXT = 1, // 文字
    EMOJI = 2, // 表情
    IMAGE = 3, // 图片
    AUDIO = 4, // 语音
    VIDEO = 5, // 视频
    SYSTEM = 6, // 系统通知
    RedPacket = 7, // 红包
  }

  export interface Message extends Common.DBDoc {
    sid?: string // Seesion Id
    uid: string
    timestamp: number
    sent: boolean // 是否已发送
    read: boolean // 是否已读
    type: MessageType
    content?: any
    to?: string // 接收者uid，只对服务端离线消息生效
  }

  export enum RedPacketType {
    Random, // 拼手气
    Quota, // 定额
  }

  export enum RedPacketStatus {
    Unclaimed, // 待领取
    WrittenOff, // 被领取
    Pullback, // 退回
  }

  export interface RedPacketOrder extends Common.DBDoc {
    sid: string
    uid: string
    name: string
    avatar: string
    note: string
    type: RedPacketType
    amount: number
    count: number
    payId: string
    timestamp: number
  }

  export interface RedPacket extends Common.DBDoc {
    uid?: string
    name?: string
    avatar?: string
    note?: string
    amount: number
    status: RedPacketStatus
    orderId: string
    createTime: number
    updateTime: number
  }
}