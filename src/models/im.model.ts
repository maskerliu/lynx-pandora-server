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

  export enum MessageType {
    TEXT = 1, // 文字
    EMOJI = 2, // 表情
    IMAGE = 3, // 图片
    AUDIO = 4, // 语音
    VIDEO = 5, // 视频
    SYSTEM = 6 // 系统通知
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
}