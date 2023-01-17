import { Autowired, Service } from 'lynx-express-mvc'
import { User } from '../models'
import { GradeRepo, GradeScoreRecordRepo } from '../repository/user.repo'
import UserService from './user.service'
import GradeConfigs from './grade.config.json'

@Service()
export class GradeService {

  @Autowired()
  private userService: UserService

  @Autowired()
  private gradeRepo: GradeRepo

  @Autowired()
  private recordRepo: GradeScoreRecordRepo

  async init() {
    // await this.gradeRepo.importData(GradeConfigs)
  }

  async getMyGradePrivileges(token: string) {
    let uid = await this.userService.token2uid(token)
  }

  async getGradeConfig() {

  }

  async updateScore(uid: string, score: number, note: string) {

    await this.userService.updateScore(uid, score)
    let record: User.GradeScoreRecord = {
      uid, score, note, timestamp: new Date().getTime()
    }
    return await this.recordRepo.add(record)
  }


}