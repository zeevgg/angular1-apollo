var path = require('path');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [{
      test: /\.ts$/,
      exclude: /node_modules/,
      use: [{
        loader: 'ts-loader'
      }]
    }]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  plugins: [
    new CopyWebpackPlugin([{
      from: __dirname + '/src/public'
    }])
  ],
  devServer: {
    contentBase: './src/public',
    stats: 'minimal',
    proxy: {
      '/graphql': {
        target: 'http://localhost:4300',
        secure: false
      },
      '/graphiql': {
        target: 'http://localhost:4300',
        secure: false
      }
    }

  }
};
