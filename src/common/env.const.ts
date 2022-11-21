import path from 'path'


export const APP_BASE_DIR = path.join(path.resolve(), 'user_data')
export const DB_DIR = path.join(APP_BASE_DIR, 'biz_storage')
export const STATIC_DIR = path.join(APP_BASE_DIR, 'biz_static')