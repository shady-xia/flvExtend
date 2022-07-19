const path = require('path')
const production = process.env.NODE_ENV === 'production' || false
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: production ? 'flvExtend.min.js' : 'flvExtend.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'FlvExtend',
      type: 'umd'
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
  optimization: {
    minimize: production,
    minimizer: [
      new TerserPlugin({
        extractComments: false
      })
    ]
  }
}
