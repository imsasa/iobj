"use strict";
let path       = require('path');
const alias    = {
    // comm: path.resolve(__dirname, "../src/script/comm.js"),
    vue: 'vue/dist/vue.js'
};
let webpackCfg = {
    devtool: "cheap-module-source-map",
    entry  : './src/index.js',
    output : {
        filename     : '[name].js',
        path         : path.resolve(__dirname, "./dist/www"),
        chunkFilename: '_asset_/script/chunk/[$name].[chunkhash:5].chunk.js',
        publicPath   : "/",
        libraryTarget: "umd",
    },
    mode   : 'development'
};

module.exports = webpackCfg;
