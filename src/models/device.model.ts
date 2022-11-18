
import { Common } from './common.model'

export namespace Device {

    export interface DeviceInfo extends Common.BasicDBDoc {
        deviceId:string,
        companyId: string,
        address: number,
        lat: number,
        lng: number,
    }


    export interface CompanyInfo extends Common.BasicDBDoc{
        name: string,
        phone: string,
    }
}