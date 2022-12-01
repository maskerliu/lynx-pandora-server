'use strict'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import path from 'path'
import { fileURLToPath } from 'url'
import webpack, { Configuration } from 'webpack'
import ExternalsPlugin from "webpack-node-externals"

import config from './build.config.json' assert { type: 'json' }

const { DefinePlugin, HotModuleReplacementPlugin, NoEmitOnErrorsPlugin, } = webpack
const dirname = path.dirname(fileURLToPath(import.meta.url))

export default class MainConfig implements Configuration {

  devtool: Configuration['devtool'] = 'eval-cheap-module-source-map'
  mode: Configuration['mode'] = 'development'
  target: Configuration['target'] = 'node'
  entry: Configuration['entry'] = { index: path.join(dirname, '../src/index.ts') }
  externals: Configuration['externals'] = ExternalsPlugin()
  externalsPresets: Configuration['externalsPresets'] = { node: true }

  module: Configuration['module'] = {
    rules: [
      {
        test: /.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          transpileOnly: true
        },
      },
    ],
  }

  node: Configuration['node'] = {}

  output: Configuration['output'] = {
    filename: '[name].cjs',
    library: { type: 'commonjs2' },
    path: path.join(dirname, '../dist/'),
    publicPath: './'
  }

  plugins: Configuration['plugins'] = [
    new NoEmitOnErrorsPlugin(),
  ]

  resolve: Configuration['resolve'] = {
    alias: {

    },
    extensions: ['.ts', '.js', '.json', '.node']
  }

  init() {
    
    this.node = {
      __dirname: process.env.NODE_ENV !== 'production',
      __filename: process.env.NODE_ENV !== 'production'
    }

    this.plugins?.push(new DefinePlugin({
      'process.env.NODE_ENV': `"${this.mode}"`,
      'process.env.BUILD_CONFIG': `'${JSON.stringify(config)}'`
    }))

    this.plugins?.push(
      new CopyWebpackPlugin({
        patterns: [{
          from: path.join(dirname, '../cert/**/*'),
          to: path.join(dirname, '../dist/'),
        }]
      }),
      // new BundleAnalyzerPlugin({
      //   analyzerMode: 'server',
      //   analyzerHost: '127.0.0.1',
      //   analyzerPort: 9088,
      //   reportFilename: 'report.html',
      //   defaultSizes: 'parsed',
      //   openAnalyzer: true,
      //   generateStatsFile: false,
      //   statsFilename: 'stats.json',
      //   statsOptions: null,
      //   logLevel: 'info'
      // }),
    )

    if (process.env.NODE_ENV !== 'production') {
      this.plugins?.push(new HotModuleReplacementPlugin())
    } else {
      this.devtool = false
    }

    return this
  }
}