import { Common } from '.'

export namespace VIP {

  export enum VIPStatus {
    On,  // 在线
    Off  // 下线
  }

  export enum VIPType {
    Normal,
    SVIP
  }

  export interface VIPItem extends Common.DBDoc {
    name: string
    type: VIPType
    price: number
    discount: number
    expired: number
    status: VIPStatus
    seq: number
  }

  export interface VIPOrder extends Common.DBDoc {
    uid: string
    vipId: string
    type: VIPType
    payId: string
    timestamp: number
    expired: number
  }
}