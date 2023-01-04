import compression from 'compression'
import cors, { CorsOptions } from 'cors'
import express, { Application, Response } from 'express'
import fileUpload from 'express-fileupload'
import expressStaticGzip from 'express-static-gzip'
import fs from 'fs'
import { Autowired, Component } from 'lynx-express-mvc'
import path from 'path'
import { getLocalIP } from './common/common.utils'
import { APP_BASE_DIR, DB_DIR, STATIC_DIR } from './common/env.const'
import BizRouter from './router'

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
    // this.bizRouter.instance()
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
      'https://maskerliu.github.io',
      `http://${getLocalIP()}:9081`,
      `https://${getLocalIP()}:9081`,
      `http://${getLocalIP()}:9082`,
      `https://${getLocalIP()}:9082`,
      `https://${getLocalIP()}:8884`
    ]

    this.httpApp.use(express.static('./static'))
    this.httpApp.use('/_res', expressStaticGzip(STATIC_DIR, {
      enableBrotli: true,
      orderPreference: ['gz', 'br'],
      serveStatic: {
        maxAge: '30 days',
        setHeaders: (res, path, stat) => {
          res.setHeader
          res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
          res.setHeader('Access-Control-Allow-Origin', '*')
        }
      }
    }))
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

  instance() { }
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
  localServer.instance()
  localServer.start()
}, 500)
