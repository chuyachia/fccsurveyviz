var path = require('path');
var webpack = require('webpack');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
module.exports = {
 entry: './src/index.js',
 output: {
     path: path.resolve(__dirname, 'client/js'),
     filename: 'bundle.js'
 },
 plugins: [new BundleAnalyzerPlugin({analyzerHost:'0.0.0.0',analyzerPort:'8081'})],
 module: {
     rules: [
         {
             test: /\.js$/,
             loader: 'babel-loader',
             query: {
                 presets: ['es2015']
             }
         }
     ]
 },
 stats: {
     colors: true
 },
 devtool: 'source-map'
};