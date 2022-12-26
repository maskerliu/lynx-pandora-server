import { Autowired, BodyParam, Controller, Get, Post, QueryParam } from 'lynx-express-mvc'
import { Lynx_Mqtt_Broker } from '../common/env.const'
import { Common, RemoteAPI } from '../models'
import DBMgrService from '../service/dbmgr.service'


@Controller(RemoteAPI.Common.BasePath)
export default class CommonController {

  @Autowired()
  private dbMgrService: DBMgrService

  @Get(RemoteAPI.Common.AppConfig)
  async getAppConfig() {

    return {
      broker: Lynx_Mqtt_Broker,
      test: 'hello world'
    }
  }

  @Get(RemoteAPI.Common.DBMgrDBs)
  async getAllDB() {
    return await this.dbMgrService.getAllDB()
  }

  @Get(RemoteAPI.Common.DBMgrDBDocs)
  async getDBDetail(@QueryParam('db') db: string) {
    return await this.dbMgrService.getDoc(db)
  }

  @Post(RemoteAPI.Common.DBMgrDBDocUpdate)
  async updateDBDoc(@QueryParam('db') db: string, @BodyParam() doc: any) {
    return await this.dbMgrService.updateDoc(db, doc)
  }

  @Get(RemoteAPI.Common.DBMgrDBDocDelete)
  async deleteDoc(@QueryParam('db') db: string, @BodyParam() doc: Common.DBDoc) {
    return await this.dbMgrService.deleteDoc(db, doc._id, doc._rev)
  }
  
}