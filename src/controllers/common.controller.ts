import { Controller, Get, QueryParam } from 'lynx-express-mvc'
import { Lynx_Mqtt_Broker } from '../common/env.const'


@Controller('/common')
export default class CommonController {

  @Get('/appConfig')
  async getAppConfig() {

    return {
      broker: Lynx_Mqtt_Broker
    }
  }


}