import { Repository } from 'lynx-express-mvc'
import path from 'path'
import BaseRepo from './base.repo'

@Repository(path.resolve(), 'device-data.db', ['uid'])
export default class DeviceDataRepo extends BaseRepo<any> {
    
}