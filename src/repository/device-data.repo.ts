import { Repository } from 'lynx-express-mvc'
import path from 'path'
import { DB_DIR } from '../common/env.const'
import BaseRepo from './base.repo'

@Repository(DB_DIR, 'device-data.db', ['uid'])
export default class DeviceDataRepo extends BaseRepo<any> {
    
}