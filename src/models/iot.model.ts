
import { Common } from './common.model'

export namespace IOT {

  export enum DeviceStatus {
    Online,
    Offline
  }

  export enum CompanyStatus {
    Verifing, // 认证中
    Verified, //通过认证
    WrittenOff, // 注销
  }

  export interface Device extends Common.DBDoc {
    deviceId: string,
    status?: DeviceStatus,
    address?: number,
    lat: number,
    lng: number,
    cid?: string
  }

  export interface Company extends Common.DBDoc {
    status: CompanyStatus
    name: string
    address?: string
    owner?: string
    ownerName?: string
    tel?: string
    privileges?: Array<Privilege>
    roles?: Array<Role>
  }

  export interface Operator extends Common.DBDoc {
    uid: string // user id
    cid: string
    roles: Array<string>
    fullRoles?: Array<Role>
    privileges?: Array<string>
  }

  export interface Role extends Common.DBDoc {
    name: string
    desc: string
    cid: string // company id
    privileges?: Array<string>
  }

  export interface Privilege {
    id: string
    name: string
  }

  export interface IOTMsg {
    from: string,
    type: MsgType
    data?: MonitorSnap
  }

  export interface MonitorSnap {
    temperature: number,
    humidity: number,
    speed: number,
    voltage: number,
    electric: number,
    pressure: number,
    timestamp: number
  }

  export enum MsgType {
    DATA = 0, // 数据
    REGISTER = 1, // 注册
    REBOOT = 2, // 重启
    KICKOUT = 3, // 踢出链接,
    TMP_SUBSCRIBED = 4, // 临时订阅
    TMP_UNSUBSCRIBED = 5, // 取消临时订阅
  }
}