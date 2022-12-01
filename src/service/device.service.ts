import { Autowired, Service } from 'lynx-express-mvc'
import { connect, IClientOptions, MqttClient } from 'mqtt'
import { Lynx_Mqtt_Broker } from '../common/env.const'
import { IOT } from '../models/iot.model'
import { DeviceRepo } from '../repository/iot.repo'

@Service()
export default class DeviceMgrService {

  @Autowired()
  deviceRepo: DeviceRepo

  private client: MqttClient
  private options: IClientOptions = {
    host: '',
    port: 8883,
    protocol: 'mqtts',
    username: 'lynx-iot',
    password: '12345678',
    clientId: 'lynx-iot-server'
  }

  constructor() {
    this.initMqttClient()
  }


  private initMqttClient() {
    this.options.host = Lynx_Mqtt_Broker
    this.client = connect(this.options)

    // set callback handlers
    this.client.on('connect', () => {
      this.client.subscribe('my/test/android')
      this.client.subscribe('my/test/web')
      this.client.subscribe('my/test/nodered')
    })

    this.client.on('error', (error) => { console.log(error) })

    this.client.on('message', async (topic, message) => {
      let msg = JSON.parse(message.toString()) as IOT.IOTMsg
      switch (msg.type) {
        case IOT.MsgType.DATA:
          // handle monitor data
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
    })
  }

  public async searchDevices(keyword: string) {
    return await this.deviceRepo.search('deviceId', keyword, ['_id', 'deviceId', 'address', 'lat', 'lng'])
  }

  public async getDeviceInfo(deviceId: string) {
    let result = await this.deviceRepo.get('deviceId', deviceId, ['_id', 'deviceId', 'address', 'lat', 'lng'])
    result.lat = result?.lat ? result.lat : 31.2422
    result.lng = result?.lng ? result.lng : 121.3232
    return result
  }

  public async save(device: IOT.Device) {
    return await this.deviceRepo.update(device)
  }

  public async delete(deviceId: string) {
    let device = await this.deviceRepo.get('deviceId', deviceId)
    let result = await this.deviceRepo.delete(device._id)
    if (result)
      return `设备[${deviceId}]已被移除`
    else
      return `设备[${deviceId}]移除失败`
  }

}