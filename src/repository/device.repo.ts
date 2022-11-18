import { Repository } from 'lynx-express-mvc'
import path from 'path'
import BaseRepo from './base.repo'

@Repository(path.resolve(), 'device.db', ['uid'])
export default class DeviceRepo extends BaseRepo<any> {
    
}