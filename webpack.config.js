const webpack = require('webpack');
const path = require('path');
const BabiliPlugin = require('babili-webpack-plugin');

//const DEVELOPMENT = process.env.NODE_ENV.trim() === 'development';
//const PRODUCTION  = process.env.NODE_ENV.trim() === 'production';

const minifier = new BabiliPlugin({
}, {});
const config = [];

// Compose fp library
config.push({
  entry: __dirname + '/src/interactable.js',
  //devtool: 'source-map',
  plugins: [
    minifier
  ],
  output: {
    path: path.resolve('./dist'),
    publicPath: '/dist/',
    filename: 'interaction.min.js'
  }
});

config.push({
  entry: __dirname + '/src/interactable.js',
  output: {
    path: path.resolve('./dist'),
    publicPath: '/dist/',
    filename: 'interaction.js'
  }
});

module.exports = config;