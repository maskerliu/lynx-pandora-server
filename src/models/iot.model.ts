
import { Common } from '.'

export namespace IOT {

  export enum DeviceStatus {
    Online,
    Offline
  }

  export interface Device extends Common.DBDoc {
    deviceId: string,
    status?: DeviceStatus,
    address?: string,
    lat: number,
    lng: number,
    cid?: string
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