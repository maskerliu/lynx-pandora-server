import { Common } from '.'

export namespace Payment {

  export interface PayChannel extends Common.DBDoc {
    name: string
    icon: string
    color: string
  }

  export interface PurchaseItem extends Common.DBDoc {
    diamonds: number
    discount: number    
    price: number
  }

  export interface Wallet extends Common.DBDoc {
    uid: string
    diamonds: number
    purse: number
  }

  export interface PayRecord extends Common.DBDoc {
    uid: string
    diamonds: number
    channel: string
    timestamp: number
    snap: Wallet
  }

  export interface PurseRecord extends Common.DBDoc {
    uid: string
    purse: number
    timestamp: number
    snap: Wallet
  }

}