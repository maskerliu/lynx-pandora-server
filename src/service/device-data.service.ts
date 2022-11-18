import { Autowired, Service } from 'lynx-express-mvc'
import DeviceDataRepo from '../repository/device-data.repo'


@Service()
export default class DeviceDataService {


    @Autowired()
    accountRepo: DeviceDataRepo

    handleMonitorData() {

    }

}