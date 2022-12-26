import { Autowired, Service } from 'lynx-express-mvc'
import { IOT } from '../models/iot.model'
import { DeviceRepo } from '../repository/iot.repo'
import MQClient from './mqtt.client'

@Service()
export default class DeviceMgrService {

  @Autowired()
  private deviceRepo: DeviceRepo

  @Autowired()
  private mqClient: MQClient

  init() {
    this.mqClient.onIOTMsgArrived = { thiz: this, handler: this.handleMsg }
    this.mqClient.onIOTClientMsgArrived = {
      thiz: this, handler: async () => {
        // TODO: update iot device status
      }
    }
  }

  private async handleMsg(topic: string, msg: IOT.IOTMsg) {
    switch (msg.type) {
      case IOT.MsgType.DATA:
        // handle monitor data
        console.log(msg)
        break
      case IOT.MsgType.REGISTER:
        let device = await this.deviceRepo.get('deviceId', msg.from)
        if (device == null) {
          device = {
            deviceId: msg.from,
            status: IOT.DeviceStatus.Online,
            lat: 31.2422,
            lng: 121.3232,
          }
          await this.deviceRepo.update(device)
        }
        break
      default:
        break
    }
  }

  public async searchDevices(keyword: string) {
    return await this.deviceRepo.search('deviceId', keyword, ['_id', 'deviceId', 'address'])
  }

  public async getDeviceInfo(deviceId: string) {
    let result = await this.deviceRepo.get('deviceId', deviceId)
    result.lat = result?.lat ? result.lat : 31.2422
    result.lng = result?.lng ? result.lng : 121.3232
    delete result._rev
    return result
  }

  public async save(device: IOT.Device) {
    return await this.deviceRepo.update(device)
  }

  public async delete(deviceId: string) {
    let result = await this.deviceRepo.delete(deviceId)
    if (result)
      return `设备[${deviceId}]已被移除`
    else
      return `设备[${deviceId}]移除失败`
  }

}