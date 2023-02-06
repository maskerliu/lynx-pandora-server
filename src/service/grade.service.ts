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

  private Grade_Configs: Array<User.GradeItem> = []

  async init() {
    // await this.gradeRepo.importData(GradeConfigs)
    let result = await this.gradeRepo.all()
    result.forEach(it => { delete it._rev })
    this.Grade_Configs = result
  }

  async getMyGradePrivileges(token: string) {
    let uid = await this.userService.token2uid(token)
  }

  async userGradeInfo(uid: string) {
    let profile = await this.userService.getUserInfo(uid)

    let i = 0
    for (i = 0; i < GradeConfigs.length; ++i) {
      if (this.Grade_Configs[i].score > profile.score) break
    }

    let gradeInfo: User.UserGradeInfo = {
      gradeLevel: this.Grade_Configs[i].level,
      curGradeIcon: this.Grade_Configs[i].icon,
      curGradeName: this.Grade_Configs[i].icon,
      nextGradeIcon: this.Grade_Configs[i + 1]?.icon,
      nextGradeName: this.Grade_Configs[i + 1]?.name,
      diffScore: this.Grade_Configs[i + 1]?.score - profile.score
    }

    return gradeInfo
  }

  async getGradeConfig() {
    return this.Grade_Configs
  }

  async updateScore(uid: string, score: number, note: string) {

    await this.userService.updateScore(uid, score)
    let record: User.GradeScoreRecord = {
      uid, score, note, timestamp: new Date().getTime()
    }
    return await this.recordRepo.add(record)
  }


}