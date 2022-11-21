import { Autowired, Service } from 'lynx-express-mvc'
import { User } from '../models/user.model'
import AccountRepo from '../repository/account.repo'

import { Dubbo } from 'apache-dubbo-consumer'
import { Zk } from 'apache-dubbo-registry'
import DubboSerives from './dubbo'

@Service()
export default class AccountService {

    dubbo = new Dubbo<typeof DubboSerives>({
        application: {
            name: 'hello-api'
        },
        registry: Zk({ connect: 'localhost:2181' }),
        services: DubboSerives
    })

    @Autowired()
    accountRepo: AccountRepo

    async login(phone: string, verify: string) {
        await this.dubbo.service.DataService.sayHello('dubbo-js')

        let account = await this.accountRepo.get('phone', phone)
        if (account != null && account.encryptPWD == verify) {
            let token = this.genToken(account._id)
            account.token = token
            this.accountRepo.update(account)
            return token
        } else {
            throw '手机号/密码错误'
        }
    }

    async register(phone: string, pwd: string) {
        let token = null
        let account = await this.accountRepo.get('phone', phone)
        if (account != null) {
            throw '该手机号已被注册'
        } else {
            let account: User.Account = {
                _id: null,
                _rev: null,
                phone: phone,
                encryptPWD: pwd
            }
            let uid = await this.accountRepo.update(account)

        }
        return token
    }

    async getUserInfos() {


    }

    async getUserInfo(uid: string) {

        let user: User.UserInfo

        return user
    }

    private genToken(uid: string): string {
        return null
    }
}