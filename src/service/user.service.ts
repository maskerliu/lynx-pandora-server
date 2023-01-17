import { UploadedFile } from 'express-fileupload'
import { Autowired, Service } from 'lynx-express-mvc'
import md5 from 'md5'
import path from 'path'
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
    await this.userInfoRepo.save(profile)
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
      let uid = await this.accountRepo.add(account)
    }
    return token
  }

  async updateAvatar(avatar: UploadedFile, token: string) {
    if (avatar == null) throw '头像更新失败'

    let uid = await this.token2uid(token)
    let profile = await this.userInfoRepo.get('uid', uid)

    let ext = avatar.name.split('.').pop()
    await avatar.mv(path.join(STATIC_DIR, avatar.md5 + '.' + ext))
    if (profile == null) {
      profile = { uid, score: 0, avatar: `/_res/${avatar.md5}.${ext}` }
      await this.userInfoRepo.add(profile)
    } else {
      profile.avatar = `/_res/${avatar.md5}.${ext}`
      await this.userInfoRepo.save(profile)
    }

    return '头像更新成功'
  }

  async updateScore(uid: string, score: number) {
    let profile = await this.userInfoRepo.get('uid', uid)
    profile.score = profile.score != null ? profile.score + score : score

    await this.userInfoRepo.save(profile)
  }

  async saveProfile(profile: User.Profile, token: string) {
    let uid = await this.token2uid(token)
    if (uid == null) throw '登录信息过期，请重新登录'
    let dbProfile = await this.userInfoRepo.get('uid', uid)
    if (dbProfile) {
      return await this.userInfoRepo.add(profile)
    } else {
      profile._rev = dbProfile._rev
      return await this.userInfoRepo.save(profile)
    }
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
    return await this.userInfoRepo.bulkGet(uids)
  }

  async getUserInfo(uid: string) {
    let account = await this.accountRepo.get('_id', uid)
    return await this.genProfile(account)
  }

  private async genProfile(account?: User.Account) {
    if (account == null) throw '未找到该用户'
    let profile = await this.userInfoRepo.get('uid', account._id)
    if (profile == null) profile = { uid: account._id, score: 0 }
    if (profile.score == null) profile.score = 0

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