// plugins
const HtmlWebpackPlugin = require('html-webpack-plugin');

// libs
const path = require('path');
const os = require('os');

// constants
const CONSTANTS = {
  DIR: {
    APP: __dirname,
    SRC: path.resolve(__dirname, 'client'),
    DIST: path.resolve(__dirname, 'dist_client'),
    NODE_MODULES: path.resolve(__dirname, 'node_modules'),
  },
  ENV: {
    NODE: {
      CURRENT: (process.env.NODE_ENV && String(process.env.NODE_ENV)) || 'development',
      PRODUCTION: 'production',
      DEVELOPMENT: 'development',
    },
  },
  AVAILABLE_CPU: os.cpus().length,
};

module.exports = {
  mode: CONSTANTS.ENV.NODE.DEVELOPMENT,
  context: CONSTANTS.DIR.APP,
  entry: {
    index: CONSTANTS.DIR.SRC + '/index.ts',
  },
  output: {
    path: CONSTANTS.DIR.DIST,
    filename: '[name].js',
    publicPath: '/',
  },
  resolve: {
    modules: [CONSTANTS.DIR.SRC, CONSTANTS.DIR.NODE_MODULES],
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.css/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
        ],
      },
      {
        test: /\.(tsx?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve(CONSTANTS.DIR.SRC, 'tsconfig.json'),
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      inject: true,
      hash: true,
      template: CONSTANTS.DIR.SRC + '/index.html',
    }),
  ],
  watch: true,
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000,
    ignored: /node_modules/,
  },
  devServer: {
    contentBase: CONSTANTS.DIR.DIST,
    hot: true,
    disableHostCheck: true,
    port: 8000,
    historyApiFallback: true, // rewrite get request(html/text) without dot in path to index.html
  },
  devtool: 'source-map',
};
