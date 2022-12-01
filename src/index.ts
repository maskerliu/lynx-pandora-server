import compression from 'compression'
import cors, { CorsOptions } from 'cors'
import express, { Application, Response } from 'express'
import fileUpload from 'express-fileupload'
import fs from 'fs'
import { Autowired, Component } from 'lynx-express-mvc'
import { APP_BASE_DIR, DB_DIR, STATIC_DIR } from './common/env.const'
import BizRouter from './router'

import webpack from 'webpack'
import WebpackDevMiddleware from 'webpack-dev-middleware'
import WebpackHotMiddleware from 'webpack-hot-middleware'
import MainConfig from '../scripts/webpack.config'
import path from 'path'

@Component()
export default class BizServer {

  private buildConfig = JSON.parse(process.env.BUILD_CONFIG)
  private port: number = 8884
  private httpServer: any
  public httpApp: Application

  @Autowired()
  bizRouter: BizRouter

  private corsOpt: CorsOptions = {
    credentials: true,
    optionsSuccessStatus: 200,
  }

  public async start() {
    this.bizRouter.init()
    this.initHttpServer()

    if (this.httpServer != null) {
      this.httpServer.close(() => { this.httpServer = null })
    }
    this.startHttpServer()
  }

  private initHttpServer() {
    this.httpApp = express()
    this.corsOpt.origin = [
      // `http://localhost:${this.port}`,
      // `http://localhost:9081`,
      'http://192.168.25.16:9081',
      'https://192.168.25.16:9081',
      'http://192.168.101.7:9081',
      'https://maskerliu.github.io'
    ]

    this.httpApp.use(express.static('./static'))
    this.httpApp.use('/_res', express.static(STATIC_DIR))
    this.httpApp.use(cors(this.corsOpt))
    this.httpApp.use(compression())
    this.httpApp.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }))
    this.httpApp.use(express.json({ type: ['application/json'], limit: '50mb' }))
    this.httpApp.use(fileUpload({ useTempFiles: true, tempFileDir: './static/tmp' }))
    this.httpApp.all('*', (req: any, resp: Response) => { this.handleRequest(req, resp) })
  }

  private async startHttpServer() {
    let HTTP: any
    let baseDir = process.env.NODE_ENV == 'development' ? '' : path.resolve() + '/'
    if (this.buildConfig.protocol == 'https') {
      HTTP = await import('https')
      var key = fs.readFileSync(baseDir + 'cert/private.key')
      var cert = fs.readFileSync(baseDir + 'cert/mydomain.crt')
      let opt = { key, cert }
      this.httpServer = HTTP.createServer(opt, this.httpApp)
    } else {
      HTTP = await import('http')
      this.httpServer = HTTP.createServer(this.httpApp)
    }

    this.httpServer.listen(
      this.port,
      '0.0.0.0',
      () => console.log(`--启动本地代理Http服务--[${this.port}]`)
    )
  }

  private handleRequest(req: any, resp: Response) {
    this.bizRouter.route(req, resp)
  }

  init() { }
}

function initAppEnv() {
  fs.open(APP_BASE_DIR, (err) => {
    if (err) {
      fs.mkdir(APP_BASE_DIR, (err) => {
        if (err) {
          initAppEnv()
        } else {
          fs.open(DB_DIR, (err) => { if (err) fs.mkdirSync(DB_DIR) })
          fs.open(STATIC_DIR, (err) => { if (err) fs.mkdirSync(STATIC_DIR) })
        }
      })
    } else {
      fs.open(DB_DIR, (err) => { if (err) fs.mkdirSync(DB_DIR) })
      fs.open(STATIC_DIR, (err) => { if (err) fs.mkdirSync(STATIC_DIR) })
    }
  })
}

initAppEnv()

setTimeout(() => {
  const localServer = new BizServer()
  localServer.init()
  localServer.start()
}, 500)
