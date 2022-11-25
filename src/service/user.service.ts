import { Autowired, Service } from 'lynx-express-mvc'
import md5 from 'md5'
import { AccountRepo, UserInfoRepo } from '../repository/user.repo'

import { Dubbo } from 'apache-dubbo-consumer'
import { Zk } from 'apache-dubbo-registry'
import { User } from '../models/user.model'
import DubboSerives from './dubbo'
import fileUpload, { UploadedFile } from 'express-fileupload'
import path from 'path'
import { STATIC_DIR } from '../common/env.const'

@Service()
export default class UserService {

  dubbo = new Dubbo<typeof DubboSerives>({
    application: {
      name: 'hello-api'
    },
    registry: Zk({ connect: 'localhost:2181' }),
    services: DubboSerives
  })

  @Autowired()
  accountRepo: AccountRepo

  @Autowired()
  userInfoRepo: UserInfoRepo

  async login(phone: string, verify: string) {
    let result = await this.dubbo.service.DataService.sayHello('dubbo-js')
    console.log(result.res)

    let account = await this.accountRepo.get('phone', phone)
    if (account != null) {
      let token = this.genToken(account._id)
      account.token = token
      this.accountRepo.update(account)
      return token
    } else {
      let _id = await this.accountRepo.update({ phone })
      let token = this.genToken(_id)
      await this.accountRepo.update({ _id, phone, token })
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
    if (avatar != null) {
      let profile = await this.getMyProfile(token)
      let ext = avatar.name.split('.').pop()
      await avatar.mv(path.join(STATIC_DIR, avatar.md5 + '.' + ext))
      profile.avatar = `http://192.168.25.16:8884/_res/${avatar.md5}.${ext}`

      delete profile.encryptPWD
      delete profile.token
      delete profile.phone
      await this.saveUserProfile(profile, token)
      return '头像更新成功'
    }
    return '头像更新失败'
  }

  async saveUserProfile(profile: User.Profile, token: string) {
    let account = await this.accountRepo.get('token', token)
    if (profile.uid != account._id) throw '登录信息过期，请重新登录'
    profile.uid = account._id
    return await this.userInfoRepo.update(profile)
  }


  async getMyProfile(token: string) {
    let account = await this.accountRepo.get('token', token)
    return await this.genFinalProfile(account)
  }

  async findUser(phone: string) {
    let account = await this.accountRepo.get('phone', phone)
    return await this.genFinalProfile(account)
  }

  async getUserInfo(uid: string) {
    let account = await this.accountRepo.get('_id', uid)
    return await this.genFinalProfile(account)
  }

  private async genFinalProfile(account?: User.Account) {
    if (account == null) throw '未找到该用户'
    let profile = await this.userInfoRepo.get('uid', account._id)
    if (profile == null) profile = { uid: account._id }
    let finalProfile = Object.assign(account, profile)
    delete finalProfile._rev
    delete finalProfile.encryptPWD
    delete finalProfile.token
    return finalProfile
  }

  private genToken(uid: string): string {
    return md5(uid)
  }
}