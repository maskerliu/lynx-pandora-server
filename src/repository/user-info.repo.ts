import { Repository } from 'lynx-express-mvc'
import path from 'path'
import { User } from '../models/user.model'
import BaseRepo from './base.repo'

@Repository(path.resolve(), 'user-info.db', ['uid'])
export default class UserInfoRepo extends BaseRepo<User.UserInfo> {
    
}