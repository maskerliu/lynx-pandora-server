import { Repository } from 'lynx-express-mvc'
import { DB_DIR } from '../common/env.const'
import { IOT } from '../models/iot.model'
import BaseRepo from './base.repo'

@Repository(DB_DIR, 'company.db', [])
export class CompanyRepo extends BaseRepo<IOT.Company> {

}

@Repository(DB_DIR, 'role.db', ['cid'])
export class RoleRepo extends BaseRepo<IOT.Role> {

}

@Repository(DB_DIR, 'operator.db', ['cid', 'uid'])
export class OperatorRepo extends BaseRepo<IOT.Operator> {

}