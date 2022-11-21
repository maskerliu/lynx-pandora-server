import { Dubbo, java, TDubboCallResult } from 'apache-dubbo-consumer'

export interface IDataService {
  sayHello(name: string): Promise<TDubboCallResult<string>>
}

export const DataService = (dubbo: Dubbo): IDataService =>
  dubbo.proxyService<IDataService>({
    dubboInterface: `com.github.lynxchina.argus.iot.DataService`,
    methods: {
      sayHello(name: string) {
        return [java.String(name)]
      }
    }
  })