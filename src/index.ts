import compression from 'compression'
import cors, { CorsOptions } from 'cors'
import express, { Application, Response } from 'express'
import fs from 'fs'
import http from 'http'
import { Autowired, Component } from 'lynx-express-mvc'

import fileUpload from 'express-fileupload'

import { APP_BASE_DIR, DB_DIR, STATIC_DIR } from './common/env.const'
import BizRouter from './router'


@Component()
class TestServer {

  private port: number = 8884
  private httpServer: any
  private httpApp: Application

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
      `http://localhost:${this.port}`,
      `http://localhost:9081`,
      'http://192.168.25.16:9081'
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
    this.initAppEnv()
    this.httpServer = http.createServer(this.httpApp)

    this.httpServer.listen(
      this.port,
      '0.0.0.0',
      () => console.log(`--启动本地代理Http服务--[${this.port}]`)
    )
  }

  private handleRequest(req: any, resp: Response) {
    this.bizRouter.route(req, resp)
  }

  private initAppEnv() {
    if (!fs.existsSync(APP_BASE_DIR)) { fs.mkdirSync(APP_BASE_DIR) }
    if (!fs.existsSync(DB_DIR)) { fs.mkdirSync(DB_DIR) }
    if (!fs.existsSync(STATIC_DIR)) { fs.mkdirSync(STATIC_DIR) }
  }
}

const localServer: any = new TestServer()
localServer.init()
localServer.start()