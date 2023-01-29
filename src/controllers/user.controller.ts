import { UploadedFile } from 'express-fileupload'
import { Autowired, BizContext, BodyParam, Controller, FileParam, Get, Post, QueryParam } from 'lynx-express-mvc'
import { RemoteAPI, User } from '../models'
import CompanyService from '../service/organization.service'
import { GradeService } from '../service/grade.service'
import UserService from '../service/user.service'

@Controller(RemoteAPI.User.BasePath)
export default class UserController {

  @Autowired()
  private userService: UserService

  @Autowired()
  private gradeService: GradeService

  @Autowired()
  private companyService: CompanyService

  @Post(RemoteAPI.User.Login)
  async login(@BodyParam('phone') phone: string, @BodyParam('verifyCode') verify: string) {
    return await this.userService.login(phone, verify)
  }

  @Post(RemoteAPI.User.Register)
  async register(@BodyParam('phone') phone: string, @BodyParam('pwd') pwd: string) {
    return this.userService.register(phone, pwd)
  }


  @Post(RemoteAPI.User.ProfileSave)
  async updateUserProfile(@BodyParam('profile') profile: User.Profile, @FileParam('avatar') avatar: UploadedFile, context: BizContext) {
    return await this.userService.saveProfile(profile, avatar, context.token)
  }

  @Get(RemoteAPI.User.ProfileInfo)
  async getUserInfo(@QueryParam('uid') uid: string, context: BizContext) {
    if (uid == null) uid = await this.userService.token2uid(context.token)
    return await this.userService.getUserInfo(uid)
  }

  @Post(RemoteAPI.User.ProfileSearch)
  async findUser(@BodyParam('phone') phone: string, @BodyParam('name') name: string) {
    return await this.userService.findUser(phone)
  }

  @Post(RemoteAPI.User.Search)
  async searchUser(@BodyParam('name') name: string) {
    return await this.userService.searchUser(name)
  }

  @Get(RemoteAPI.User.Contact)
  async getMyContct(@QueryParam('page') page: number, context: BizContext) {
    return await this.companyService.getMyContact(context.token, page)
  }

  @Get(RemoteAPI.User.GradeConfig)
  async getGradeConfig() {
    return await this.gradeService.getGradeConfig()
  }

  @Get(RemoteAPI.User.UserGrade)
  async getUserGradeInfo(@QueryParam('uid') uid: string, context: BizContext) {
    if (uid == null) uid = await this.userService.token2uid(context.token)
    return await this.gradeService.userGradeInfo(uid)
  }

}