import { Autowired, Service } from 'lynx-express-mvc'
import AccountRepo from '../repository/account.repo'
import UserInfoRepo from '../repository/user-info.repo'


@Service()
export default class UserInfoService {


    @Autowired()
    userInfoRepo: UserInfoRepo



    login() {

    }

    getUserInfos() {

    }

    getUserInfo(uid: string) {

    }

}