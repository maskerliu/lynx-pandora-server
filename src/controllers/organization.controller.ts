import { Autowired, BizContext, BodyParam, Controller, Get, Post, QueryParam } from 'lynx-express-mvc'
import { Organization, RemoteAPI } from '../models'
import OrganizationService from '../service/organization.service'
import UserService from '../service/user.service'


@Controller(RemoteAPI.Organization.BasePath)
export class OrganizationController {

  @Autowired()
  private userService: UserService

  @Autowired()
  private organizationService: OrganizationService


  @Get(RemoteAPI.Organization.CompanySearch)
  async companySearch(@QueryParam('keyword') keyword: string, context: BizContext) {
    return await this.organizationService.searchCompany(keyword)
  }

  @Get(RemoteAPI.Organization.CompanyInfo)
  async companyInfo(@QueryParam('cid') cid: string, context: BizContext) {
    return await this.organizationService.getCompany(cid)
  }

  @Post(RemoteAPI.Organization.CompanySave)
  async saveCompany(@BodyParam() company: Organization.Company, context: BizContext) {
    return await this.organizationService.saveCompany(company, context.token)
  }

  @Get(RemoteAPI.Organization.RoleAll)
  async allRoles(@QueryParam('cid') cid: string) {
    return await this.organizationService.getRoles(cid)
  }

  @Post(RemoteAPI.Organization.RoleSave)
  async saveRole(@BodyParam('role') role: Organization.Role) {
    return await this.organizationService.saveRole(role)
  }

  @Post(RemoteAPI.Organization.RoleDelete)
  async removeRole(@BodyParam('rid') rid: string) {
    return await this.organizationService.removeRole(rid)
  }

  @Get(RemoteAPI.Organization.PagedOperators)
  async allOperators(@QueryParam('cid') cid: string, @QueryParam('page') page: number) {
    return await this.organizationService.getOperators(cid, page)
  }

  @Get(RemoteAPI.Organization.Operator)
  async getOperator(@QueryParam('uid') uid: string, context: BizContext) {
    if (uid == null) uid = await this.userService.token2uid(context.token)
    return await this.organizationService.getOperatorInfo(uid)
  }

  @Post(RemoteAPI.Organization.OperatorSave)
  async saveOperator(@BodyParam('operator') operator: Organization.Operator) {
    return await this.organizationService.saveOperator(operator)
  }

  @Post(RemoteAPI.Organization.OperatorDelete)
  async deleteOperator(@BodyParam('uid') uid: string) {
    return await this.organizationService.unbindOperator(uid)
  }
}