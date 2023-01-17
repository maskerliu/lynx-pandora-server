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
  private userService: UserService

  @Autowired()
  private companyRepo: CompanyRepo

  @Autowired()
  private roleRepo: RoleRepo

  @Autowired()
  private operatorRepo: OperatorRepo

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

    let cid: string
    if (company._id == null) {
      cid = await this.companyRepo.add(company)

      company.status = IOT.CompanyStatus.Verifing
      let uid = await this.userService.token2uid(token)
      let profile = await this.userService.getUserInfo(uid)
      let operator: IOT.Operator = {
        uid: profile.uid,
        name: profile.name,
        cid: cid,
        roles: []
      }
      await this.saveOperator(operator)
    } else {
      cid = await this.companyRepo.save(company)
    }

    return cid
  }

  async getRoles(cid: string) {
    return await this.roleRepo.search('cid', cid)
  }

  async saveRole(role: IOT.Role) {
    if (role._id) {
      return await this.roleRepo.save(role)
    } else {
      return await this.roleRepo.add(role)
    }
  }

  async removeRole(rid: string) {
    let dbItem = await this.roleRepo.get('_id', rid, ['_id', '_rev'])
    return await this.roleRepo.remove(dbItem._id, dbItem._rev)
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
    if (operator._id) {
      return await this.operatorRepo.save(operator)
    } else {
      return await this.operatorRepo.add(operator)
    }
  }

  async unbindOperator(uid: string) {
    let dbItem = await this.operatorRepo.get('uid', uid, ['_id', '_rev'])
    return await this.operatorRepo.remove(dbItem._id, dbItem._rev)
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