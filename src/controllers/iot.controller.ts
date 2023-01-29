import { Autowired, BodyParam, Controller, Get, Post, QueryParam } from 'lynx-express-mvc'
import { IOT, RemoteAPI } from '../models'
import DeviceMgrService from '../service/device.service'
import CompanyService from '../service/organization.service'


@Controller(RemoteAPI.IOT.BasePath)
export default class IOTMgrController {

  @Autowired()
  private deviceService: DeviceMgrService

  @Autowired()
  private companyService: CompanyService

  @Get(RemoteAPI.IOT.DeviceSearch)
  async search(@QueryParam('keyword') keyword: string) {
    return await this.deviceService.searchDevices(keyword)
  }

  @Get(RemoteAPI.IOT.DeviceInfo)
  async getDevice(@QueryParam('deviceId') deviceId: string) {
    return await this.deviceService.deviceInfo(deviceId)
  }

  @Post(RemoteAPI.IOT.DeviceSave)
  async updateInfo(@BodyParam('device') device: IOT.Device) {
    return await this.deviceService.save(device)
  }

  @Post(RemoteAPI.IOT.DeviceDelete)
  async removeDevice(@QueryParam('deviceId') deviceId: string) {
    return await this.deviceService.delete(deviceId)
  }
}