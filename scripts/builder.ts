'use strict'

import { deleteSync } from 'del'
import fs from 'fs'
import webpack from 'webpack'
import Config from './webpack.config.js'
import pkg from '../package.json' assert {type: 'json'}
import config from './build.config.json' assert { type: 'json' }

const Run_Mode_PROD = 'production'

process.env.NODE_ENV = Run_Mode_PROD
process.env.BUILD_CONFIG = JSON.stringify(config)

function run() {
  deleteSync(['dist/*', '!.gitkeep'])
  pack(new Config())
  genPkgFile()
}

function genPkgFile() {
  let releasePkg = {}
  releasePkg['name'] = pkg.name
  releasePkg['version'] = pkg.version
  releasePkg['type'] = pkg.type
  releasePkg['description'] = pkg.description
  releasePkg['main'] = pkg.main
  releasePkg['dependencies'] = pkg.dependencies
  fs.open('dist/', () => {

  })
  fs.writeFileSync('dist/package.json', JSON.stringify(releasePkg))
}

function pack(config: Config): Promise<string> {
  return new Promise((resolve, reject) => {
    config.mode = Run_Mode_PROD
    config.init()
    webpack(config, (err, stats) => {
      if (err) {
        reject(err.stack || err)
      } else if (stats?.hasErrors()) {
        let err = ''
        stats.toString({ chunks: false, colors: true })
          .split(/\r?\n/)
          .forEach(line => { err += `    ${line}\n` })
        reject(err)
      } else {
        resolve(stats!.toString({ chunks: false, colors: true }))
      }
    })
  })
}

run()