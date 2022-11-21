import { Repository } from 'lynx-express-mvc'
import { DB_DIR } from '../common/env.const'
import BaseRepo from './base.repo'

@Repository(DB_DIR, 'device.db', ['uid'])
export default class DeviceRepo extends BaseRepo<any> {
    
}