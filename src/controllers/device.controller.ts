import { Autowired, BizContext, BodyParam, Controller, Get, Post, QueryParam } from 'lynx-express-mvc'
import DeviceDataService from '../service/device-data.service'
import DeviceMgrService from '../service/device-mgr.service'


@Controller('/account')
export default class DeviceController {

    @Autowired()
    deviceMgrService: DeviceMgrService

    @Autowired()
    deviceDataService: DeviceDataService

    @Post('/login')
    async receiveData(@BodyParam('phone') phone: string, @BodyParam('pwd') pwd: string, context: BizContext) {

        return `hello ${phone}`
    }

    @Get('/deviceInfo')
    async deviceInfo(@QueryParam('did') did: string) {

    }



}