import { Common } from './common.model'


export namespace User {

  export enum UserGender {
    FEMALE,
    MALE,
    UNKNOWN
  }

  export interface UserAuth {
    role: string, // 角色
    expired: number, // 有效期
  }

  export enum UserOnlineStatus {
    Unknown = -1,
    Offline = 0,
    Online = 1
  }

  export interface Profile extends Common.DBDoc {
    uid: string,
    showNo?: string,
    name?: string,
    gender?: UserGender,
    avatar?: string,
    onlineStatus?: UserOnlineStatus
    score: number
  }

  export interface Account extends Common.DBDoc {
    phone: string,
    encryptPWD?: string,
    token?: string,
  }

  export interface GradeItem extends Common.DBDoc {
    level: number
    score: number
    icon: string
    name: string
    group: string
  }

  export interface GradeScoreRecord extends Common.DBDoc {
    uid: string
    score: number
    note: string // 积分来源备注
    timestamp: number
  }
}