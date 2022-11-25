import path from 'path'


export const APP_BASE_DIR = path.join(path.resolve(), 'user_data')
export const DB_DIR = path.join(APP_BASE_DIR, 'biz_storage')
export const STATIC_DIR = path.join(APP_BASE_DIR, 'biz_static')
export const Lynx_Mqtt_Broker = 'f9cc4cbec7c54744b1448fe4e6bfd274.s2.eu.hivemq.cloud'