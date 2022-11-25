import { UploadedFile } from 'express-fileupload'
import { Autowired, BizContext, BodyParam, Controller, FileParam, Post } from 'lynx-express-mvc'
import { RemoteAPI } from '../models/api.const'
import { User } from '../models/user.model'
import UserService from '../service/user.service'

@Controller(RemoteAPI.User.BasePath)
export default class UserController {

  @Autowired()
  userService: UserService

  @Post(RemoteAPI.User.Login)
  async login(@BodyParam('phone') phone: string, @BodyParam('verifyCode') verify: string) {
    console.log(phone, verify)
    return await this.userService.login(phone, verify)
  }

  @Post(RemoteAPI.User.Register)
  async register(@BodyParam('phone') phone: string, @BodyParam('pwd') pwd: string) {
    return this.userService.register(phone, pwd)
  }

  @Post(RemoteAPI.User.ProfileAvatar)
  async uploadUserAvatar(@FileParam('avatar') avatar: UploadedFile, context: BizContext) {
    return this.userService.updateUserAvatar(avatar, context.token)
  }

  @Post(RemoteAPI.User.ProfileSave)
  async updateUserProfile(@BodyParam('profile') profile: User.Profile, context: BizContext) {
    return await this.userService.saveUserProfile(profile, context.token)
  }

  @Post(RemoteAPI.User.ProfileMyself)
  async getMyProfile(context: BizContext) {
    return await this.userService.getMyProfile(context.token)
  }

  @Post(RemoteAPI.User.ProfileInfo)
  async getUserInfo(@BodyParam('uid') uid: string) {
    return await this.userService.getUserInfo(uid)
  }

  @Post(RemoteAPI.User.ProfileSearch)
  async findUser(@BodyParam('phone') phone: string) {
    return await this.userService.findUser(phone)
  }

}