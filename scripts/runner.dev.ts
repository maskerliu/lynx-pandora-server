
import chalk from 'chalk'
import { exec, spawn } from 'child_process'
import os from 'os'
import path from 'path'
import { deleteSync } from 'del'
import { fileURLToPath } from 'url'
import webpack from 'webpack'
import WebpackHotMiddleware from 'webpack-hot-middleware'
import config from './build.config.json' assert { type: 'json' }
import MainConfig from './webpack.config.js'

process.env.BUILD_CONFIG = JSON.stringify(config)

const dirname = path.dirname(fileURLToPath(import.meta.url))
let hotMiddleware: any
let serverProcess: any

async function startWHM() {
  return new Promise<void>((resolve, reject) => {
    let config = new MainConfig()
    config.mode = 'development'
    config.init()
    const compiler = webpack(config)
    hotMiddleware = WebpackHotMiddleware(compiler, { log: false, path: './__webpack_hmr', heartbeat: 2500 })
    compiler.hooks.watchRun.tapAsync('watch-run', (_, done) => {
      deleteSync('./dist/*.hot-update.*')
      consoleLog('compiling\n', 'green')
      done()
    })

    compiler.watch({}, (err, stats) => {
      if (err) {
        console.log(err)
        reject(err)
      } else {
        if (serverProcess && serverProcess.kill()) {
          if (os.platform() !== 'win32') {
            process.kill(serverProcess.pid!)
            serverProcess = null
            startServer()
          } else {
            const pid = serverProcess.pid
            exec(`TASKKILL /F /IM node.exe`, (err, data) => {
              if (err) console.log(err)
              else console.log(`kill pid:  ${pid} success!`)
              serverProcess = null
              startServer()
            })
          }
        }
        resolve()
      }
    })
  })
}

function startServer() {
  let args = [
    '--inspect=5858',
    '--experimental-specifier-resolution=node',
    path.join(dirname, '../dist/index.cjs')
  ]

  serverProcess = spawn('node', args)
  serverProcess.stdout?.on('data', (data: any) => { consoleLog(data, 'blue') })
  serverProcess.stderr?.on('data', (data: any) => { consoleLog(data, 'red') })
  // serverProcess.on('close', () => { process.exit() })
}

function consoleLog(data: any, color?: string) {
  let log = ''

  log += chalk[color ? color : 'yellow'](`┏ Main Process ${new Array(86).join('-')}\n\n`)
  if (typeof data === 'object') {
    // (proc == 'Electron' ? data.toString() :
    data.toString()
      .split(/\r?\n/).forEach((line: string) => { log += `  ${line}\n` })
  } else {
    log += `  ${data}\n`
  }

  if (color) {
    log = chalk[color](log)
  }

  log += chalk[color ? color : 'yellow'](`┗ ${new Array(99).join('-')}`) + '\n'
  console.log(log)
}

async function run() {
  deleteSync(['dist/*', '!.gitkeep'])
  await Promise.all([startWHM()])
  startServer()
}

run()
