const path = require('path');

module.exports = {
  entry: './index.js',
  target: 'node',
  mode: 'production',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd',
    library: 'NodeMySQLPromise',
    globalObject: 'this',
    umdNamedDefine: true,
    clean: true
  },
  optimization: {
    minimize: false
  }
};
