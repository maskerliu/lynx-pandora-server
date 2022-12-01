import { Repository } from 'lynx-express-mvc'
import { DB_DIR } from '../common/env.const'
import { IOT } from '../models/iot.model'
import BaseRepo from './base.repo'

@Repository(DB_DIR, 'device.db', ['uid'])
export class DeviceRepo extends BaseRepo<IOT.Device> {

  public async update(item: IOT.Device) {
    let result = null
    let getResult = await this.get('deviceId', item.deviceId, ['_rev'])
    if (getResult != null) {
      item._rev = getResult._rev
      result = await this.pouchdb.put(item)
    } else {
      result = await this.pouchdb.post(item)
    }

    if (result.ok)
      return result.id
    else
      throw '更新失败'
  }
}

@Repository(DB_DIR, 'device-data.db', ['uid'])
export class DeviceDataRepo extends BaseRepo<any> {

}