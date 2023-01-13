import { UploadedFile } from 'express-fileupload'
import { Autowired, Service } from 'lynx-express-mvc'
import md5 from 'md5'
import path from 'path'
import { getLocalIP } from '../common/common.utils'
import { STATIC_DIR } from '../common/env.const'
import { User } from '../models/user.model'
import { AccountRepo, UserInfoRepo } from '../repository/user.repo'
import MQClient from './mqtt.client'

@Service()
export default class UserService {

  // dubbo = new Dubbo<typeof DubboSerives>({
  //   application: {
  //     name: 'hello-api'
  //   },
  //   registry: Zk({ connect: 'localhost:2181' }),
  //   services: DubboSerives
  // })

  @Autowired()
  private mqClient: MQClient

  @Autowired()
  private accountRepo: AccountRepo

  @Autowired()
  private userInfoRepo: UserInfoRepo


  init() {
    this.mqClient.onIMClientMsgArrived = { thiz: this, handler: this.updateUserStatus }
  }

  async token2uid(token: string) {
    let account = await this.accountRepo.get('token', token)
    if (account) return account._id
    else throw '登录信息失效，请重新登录'
  }

  async updateUserStatus(topic: string, message: any) {
    let uid = topic.split('/').pop()
    let profile = await this.userInfoRepo.get('uid', uid)
    profile.onlineStatus = message.length == 0 ? User.UserOnlineStatus.Online : User.UserOnlineStatus.Offline
    await this.userInfoRepo.update(profile)
  }

  async userOnlineStatus(uid: string) {
    return (await this.userInfoRepo.get('uid', uid)).onlineStatus
  }

  async login(phone: string, verify: string) {
    // let result = await this.dubbo.service.DataService.sayHello('dubbo-js')
    // console.log(result.res)

    let account = await this.accountRepo.get('phone', phone)
    if (account != null) {
      let token = this.genToken(account._id)
      account.token = token
      await this.accountRepo.updateAccount(account)
      return token
    } else {
      let uid = await this.accountRepo.createAccount({ phone })
      let token = this.genToken(uid)
      let account = await this.accountRepo.get('phone', phone)
      account.token = token
      await this.accountRepo.updateAccount(account)
      return token
    }
  }

  async register(phone: string, pwd: string) {
    let token = null
    let account = await this.accountRepo.get('phone', phone)
    if (account != null) {
      throw '该手机号已被注册'
    } else {
      let account: User.Account = {
        phone: phone,
        encryptPWD: pwd
      }
      let uid = await this.accountRepo.update(account)
    }
    return token
  }

  async updateUserAvatar(avatar: UploadedFile, token: string) {
    if (avatar == null) {
      return '头像更新失败'
    }

    let profile = await this.getUserInfoByToken(token)
    let ext = avatar.name.split('.').pop()
    await avatar.mv(path.join(STATIC_DIR, avatar.md5 + '.' + ext))
    profile.avatar = `/_res/${avatar.md5}.${ext}`

    delete profile.encryptPWD
    delete profile.token
    delete profile.phone
    await this.saveUserProfile(profile, token)
    return '头像更新成功'
  }

  async saveUserProfile(profile: User.Profile, token: string) {
    let account = await this.accountRepo.get('token', token)
    if (profile.uid != account._id) throw '登录信息过期，请重新登录'
    profile.uid = account._id
    return await this.userInfoRepo.update(profile)
  }

  async findUser(phone: string) {
    let account = await this.accountRepo.get('phone', phone)
    return await this.genProfile(account)
  }

  async searchUser(name: string) {
    let profiles = await this.userInfoRepo.search('name', name)
    let docs = profiles.map(item => { return { id: item.uid } })
    let dbResp = await this.userInfoRepo.pouchdb.bulkGet({ docs })
    return profiles
  }

  async bulkUsers(uids: Array<string>) {
    return await this.userInfoRepo.bulkUsers(uids)
  }

  async getUserInfoByToken(token: string) {
    let account = await this.accountRepo.get('token', token)
    return await this.genProfile(account)
  }

  async getUserInfo(uid: string) {
    let account = await this.accountRepo.get('_id', uid)
    return await this.genProfile(account)
  }

  private async genProfile(account?: User.Account) {
    if (account == null) throw '未找到该用户'
    let profile = await this.userInfoRepo.get('uid', account._id)
    if (profile == null) profile = { uid: account._id }

    let finalProfile = Object.assign(account, profile)
    delete finalProfile._id
    delete finalProfile._rev
    delete finalProfile.encryptPWD
    delete finalProfile.token
    delete finalProfile.phone
    return finalProfile
  }

  private genToken(uid: string): string {
    return md5(`${uid}_${new Date().getTime()}`)
  }

  private async genMockUsers() {
    let phones = []
    for (let i = 0; i < 80; ++i) {
      let end = i.toString().padStart(2, '0')
      // await CommonApi.login(`136518888${end}`, '2222')
    }

    let opt: PouchDB.Find.FindRequest<any> = {
      selector: {
        phone: { $lt: 13651888880 }
      },
    }
    let result = await this.accountRepo.pouchdb.find(opt)
    let profiles = result.docs.map(it => {
      return { uid: it._id, name: `mock_${it._id.split('-')[0]}` }
    })
    opt = {
      selector: {
        name: { $regex: 'mock_' }
      }
    }
    result = await this.userInfoRepo.pouchdb.find(opt)
    // await this.userInfoRepo.pouchdb.bulkDocs(profiles)
  }
}