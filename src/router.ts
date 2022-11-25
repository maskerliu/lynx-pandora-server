import { Request, Response } from 'express'
import { Router, Route } from 'lynx-express-mvc'

import './controllers/common.controller'
import './controllers/user.controller'
import './controllers/iot.controller'

@Router()
export default class BizRouter {

  @Route()
  route(...args: any): boolean { return true }

  error(req: Request, resp: Response, err: any) {

  }

  init() { }
}