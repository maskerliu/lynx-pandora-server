import { Repository } from 'lynx-express-mvc'
import { DB_DIR } from '../common/env.const'
import { IOT } from '../models/iot.model'
import BaseRepo from './base.repo'

@Repository(DB_DIR, 'iot-device.db')
export class DeviceRepo extends BaseRepo<IOT.Device> {

  async init() {
    try {
      await this.pouchdb.createIndex({ index: { fields: ['uid'], ddoc: 'idx-uid' } })
    } catch (err) {
      console.error('initDB', err)
    }
  }
}

@Repository(DB_DIR, 'iot-monitor-data.db')
export class DeviceDataRepo extends BaseRepo<any> {

async init() {
    try {
      await this.pouchdb.createIndex({ index: { fields: ['uid'], ddoc: 'idx-uid' } })
    } catch (err) {
      console.error('initDB', err)
    }
  }
}