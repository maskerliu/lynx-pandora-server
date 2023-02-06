import { Component } from 'lynx-express-mvc'
import { connect, IClientOptions, MqttClient } from 'mqtt'
import { Lynx_Mqtt_Broker } from '../common/env.const'
import { IOT } from '../models'
import { IM } from '../models/im.model'


@Component()
export default class MQClient {

  private client: MqttClient
  private options: IClientOptions = {
    host: '',
    port: 8883,
    protocol: 'mqtts',
    username: 'lynx-iot',
    password: '12345678',
    clientId: 'lynx-iot-server'
  }

  onIMClientMsgArrived: { thiz: any, handler: (topic: string, message: string) => Promise<void> }
  onIOTClientMsgArrived: { thiz: any, handler: (topic: string, message: string) => Promise<void> }
  onIOTMsgArrived: { thiz: any, handler: (topic: string, message: IOT.IOTMsg) => void }

  constructor() {
    this.initMqttClient()
  }

  private initMqttClient() {
    this.options.host = Lynx_Mqtt_Broker
    this.client = connect(this.options)

    // set callback handlers
    this.client.on('connect', (packet) => {
      this.client.subscribe('_iot/data/#')
      this.client.subscribe('_client/lwt/#') // 监听Client在线状态
    })

    this.client.on('error', (error) => { console.error(error) })

    this.client.on('message', async (topic, message) => {
      if (topic.indexOf('_iot/data') != -1) {
        Reflect.apply(this.onIOTMsgArrived.handler, this.onIOTMsgArrived.thiz, [topic, JSON.parse(message.toString())])
      }

      if (topic.indexOf('_client/lwt/iot') != -1) {
        Reflect.apply(this.onIOTClientMsgArrived.handler, this.onIOTClientMsgArrived.thiz, [topic, message.toString()])
      }

      if (topic.indexOf('_client/lwt/im') != -1) {
        // console.log(topic, message.toString())
        Reflect.apply(this.onIMClientMsgArrived.handler, this.onIMClientMsgArrived.thiz, [topic, message.toString()])
      }
    })
  }

  public sendMsg(topic: string, msg: string) {
    this.client.publish(topic, msg, { qos: 0, retain: false })
  }
}