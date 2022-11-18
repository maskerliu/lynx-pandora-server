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

    export interface UserInfo extends Common.BasicDBDoc {
        showNo: string,
        name: string,
        gender: UserGender,
        avatar: string,
    }

    export interface Account extends Common.BasicDBDoc {
        phone: string,
        encryptPWD?: string,
        token?: string,
    }
}