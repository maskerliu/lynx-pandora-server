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

  async searchCompany(keyword: string) {
    let companies = await this.companyRepo.search('name', keyword)

    for (let company of companies) {
      company.privileges = All_Privileges
      company.roles = await this.roleRepo.search('cid', company._id)
      let profile = await this.userService.getUserInfo(company.owner)
      company.ownerName = profile.name
    }
    return companies
  }

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
      let profile = await this.userService.getUserInfoByToken(token)
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

  async getOperators(cid: string, page?: number) {
    return await this.operatorRepo.pagedGet(cid, page ? page : 0, 15)
  }

  async getMyOperatorInfo(token: string) {
    let uid = await this.userService.token2uid(token)
    let operator = await this.operatorRepo.get('uid', uid)

    if (operator) {
      let roles = await this.roleRepo.search('cid', operator.cid)

      let roleMap = new Map()
      roles.forEach(it => {
        roleMap.set(it._id, it)
      })

      let docs = operator.roles.map(it => { return { id: it } })
      let resp = await this.roleRepo.pouchdb.bulkGet({ docs })

      let privileges = new Set<string>()
      resp.results.forEach(it => {
        let role = it.docs[0]['ok'] as IOT.Role
        role.privileges.forEach(item => privileges.add(item))
      })
      operator.fullRoles = operator.roles.map(it => {
        return roleMap.get(it)
      })

      operator.privileges = Array.from(privileges)
    }

    delete operator?._rev
    return operator
  }

  async saveOperator(operator: IOT.Operator) {
    return await this.operatorRepo.update(operator)
  }

  async unbindOperator(uid: string) {
    return await this.operatorRepo.delete(uid)
  }

  async getMyContact(token: string, page?: number) {
    let uid = await this.userService.token2uid(token)
    let myself = await this.operatorRepo.get('uid', uid)
    if (myself != null) {
      let operators = await this.operatorRepo.pagedGet(myself.cid, page ? page : 0, 25)
      let uids = operators.map(it => { return it.uid })
      return await this.userService.bulkUsers(uids)
    } else {
      return null
    }
  }

}