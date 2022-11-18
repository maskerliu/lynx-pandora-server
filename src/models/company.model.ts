import { Common } from './common.model'

export namespace Company {

    export interface CompanyInfo extends Common.BasicDBDoc {
        name: string,
        legalPerson: string,
        phone: string
    }
}