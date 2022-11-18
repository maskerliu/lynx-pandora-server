import { Repository } from 'lynx-express-mvc'
import path from 'path'
import { User } from '../models/user.model'
import BaseRepo from './base.repo'

@Repository(path.resolve(), 'account.db', ['phone'])
export default class AccountRepo extends BaseRepo<User.Account> {
    
}