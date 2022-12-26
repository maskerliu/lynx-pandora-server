import { Autowired, BizContext, BodyParam, Controller, Get, Post, QueryParam } from 'lynx-express-mvc'
import { IOT, RemoteAPI } from '../models'
import CompanyService from '../service/company.service'
import DeviceMgrService from '../service/device.service'


@Controller(RemoteAPI.IOT.BasePath)
export default class IOTMgrController {

  @Autowired()
  deviceService: DeviceMgrService

  @Autowired()
  companyService: CompanyService

  @Get(RemoteAPI.IOT.DeviceSearch)
  async search(@QueryParam('keyword') keyword: string) {
    return await this.deviceService.searchDevices(keyword)
  }

  @Get(RemoteAPI.IOT.DeviceInfo)
  async getDevice(@QueryParam('deviceId') deviceId: string) {
    return await this.deviceService.getDeviceInfo(deviceId)
  }

  @Post(RemoteAPI.IOT.DeviceSave)
  async updateInfo(@BodyParam('device') device: IOT.Device) {
    return await this.deviceService.save(device)
  }

  @Post(RemoteAPI.IOT.DeviceDelete)
  async removeDevice(@QueryParam('deviceId') deviceId: string) {
    return await this.deviceService.delete(deviceId)
  }

  @Get(RemoteAPI.IOT.CompanySearch)
  async companySearch(@QueryParam('keyword') keyword: string, context: BizContext) {
    return await this.companyService.searchCompany(keyword)
  }

  @Get(RemoteAPI.IOT.CompanyInfo)
  async companyInfo(@QueryParam('cid') cid: string, context: BizContext) {
    return await this.companyService.getCompany(cid)
  }

  @Post(RemoteAPI.IOT.CompanySave)
  async saveCompany(@BodyParam() company: IOT.Company, context: BizContext) {
    return await this.companyService.saveCompany(company, context.token)
  }

  @Get(RemoteAPI.IOT.RoleAll)
  async allRoles(@QueryParam('cid') cid: string) {
    return await this.companyService.getRoles(cid)
  }

  @Post(RemoteAPI.IOT.RoleSave)
  async saveRole(@BodyParam('role') role: IOT.Role) {
    return await this.companyService.saveRole(role)
  }

  @Post(RemoteAPI.IOT.RoleDelete)
  async removeRole(@BodyParam('rid') rid: string) {
    return await this.companyService.removeRole(rid)
  }

  @Get(RemoteAPI.IOT.PagedOperators)
  async allOperators(@QueryParam('cid') cid: string, @QueryParam('page') page: number) {
    return await this.companyService.getOperators(cid, page)
  }

  @Get(RemoteAPI.IOT.OperatorMyself)
  async getOperator(context: BizContext) {
    return await this.companyService.getMyOperatorInfo(context.token)
  }

  @Post(RemoteAPI.IOT.OperatorSave)
  async saveOperator(@BodyParam('operator') operator: IOT.Operator) {
    return await this.companyService.saveOperator(operator)
  }

  @Post(RemoteAPI.IOT.OperatorDelete)
  async deleteOperator(@BodyParam('uid') uid: string) {
    return await this.companyService.unbindOperator(uid)
  }
}