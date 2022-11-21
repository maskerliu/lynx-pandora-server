import { Repository } from 'lynx-express-mvc'
import { DB_DIR } from '../common/env.const'
import { User } from '../models/user.model'
import BaseRepo from './base.repo'

@Repository(DB_DIR, 'account.db', ['phone'])
export default class AccountRepo extends BaseRepo<User.Account> {
    
}