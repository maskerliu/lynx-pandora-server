import { Autowired, Service } from 'lynx-express-mvc'
import DeviceRepo from '../repository/device.repo'


@Service()
export default class DeviceMgrService {


    @Autowired()
    deviceMgrRepo: DeviceRepo


    getDevices() {
        
    }

    getDeviceInfo(did: string) {

    }

}