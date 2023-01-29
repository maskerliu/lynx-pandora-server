import { Common } from '.'

export namespace Organization {
  
  export enum CompanyStatus {
    Verifing, // 认证中
    Verified, //通过认证
    WrittenOff, // 注销
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
}