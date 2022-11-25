import { Autowired, Service } from 'lynx-express-mvc'
import { IOT } from '../models'
import { CompanyRepo, OperatorRepo, RoleRepo } from '../repository/company.repo'
import UserService from './user.service'


const All_Privileges: Array<IOT.Privilege> = [
  { id: '1', name: '公司管理' },
  { id: '2', name: '角色管理' },
  { id: '3', name: '人员管理' },
  { id: '4', name: '设备管理' },
]

@Service()
export default class CompanyService {

  @Autowired()
  companyRepo: CompanyRepo

  @Autowired()
  roleRepo: RoleRepo

  @Autowired()
  operatorRepo: OperatorRepo

  @Autowired()
  userService: UserService


  async getCompany(cid: string) {
    let company = await this.companyRepo.get('_id', cid)
    company.privileges = All_Privileges
    company.roles = await this.roleRepo.search('cid', cid)
    let profile = await this.userService.getUserInfo(company.owner)
    company.ownerName = profile.name
    return company
  }

  async saveCompany(company: IOT.Company, token: string) {
    delete company.privileges
    delete company.ownerName
    delete company.roles

    let cid = await this.companyRepo.update(company)
    if (company._id == null) {
      company.status = IOT.CompanyStatus.Verifing
      let profile = await this.userService.getMyProfile(token)
      let operator: IOT.Operator = {
        uid: profile.uid,
        name: profile.name,
        cid: cid,
        roles: []
      }
      await this.saveOperator(operator)
    }
    return cid
  }

  async getRoles(cid: string) {
    return await this.roleRepo.search('cid', cid)
  }

  async saveRole(role: IOT.Role) {
    return await this.roleRepo.update(role)
  }

  async removeRole(rid: string) {
    return await this.roleRepo.delete(rid)
  }

  async getOperators(cid: string) {
    return await this.operatorRepo.search('cid', cid)
  }

  async getMyOperatorInfo(token: string) {
    let profile = await this.userService.getMyProfile(token)
    return await this.operatorRepo.get('uid', profile.uid)
  }

  async saveOperator(operator: IOT.Operator) {
    return await this.operatorRepo.update(operator)
  }

}