import { Autowired, BodyParam, Controller, Get, Post, QueryParam } from 'lynx-express-mvc'
import { User } from '../models/user.model'
import AccountService from '../service/account.service'
import UserInfoService from '../service/user-info.service'


@Controller('/user')
export default class UserController {

    @Autowired()
    userInfoService: UserInfoService

    @Autowired()
    accountService: AccountService

    @Post('/login')
    async login(@BodyParam('phone') phone: string, @BodyParam('verify') verify: string) {
        return this.accountService.login(phone, verify)
    }

    @Post('/register')
    async register(@BodyParam('phone') phone: string, @BodyParam('pwd') pwd: string) {
        this.accountService.register(phone, pwd)
    }

    @Post('/userProfile')
    async updateUserProfile(@BodyParam() userProfile: User.UserInfo) {

    }


    @Get('/userInfo')
    async getUserInfo(@QueryParam('uid') uid: string) {

    }

    
}