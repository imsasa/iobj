"use strict";
let path        = require('path');
const alias   = {
    // comm: path.resolve(__dirname, "../src/script/comm.js"),
    vue : 'vue/dist/vue.js'
};
let webpackCfg = {
    devtool: "cheap-module-source-map",
    output : {
        filename     : '_asset_/script/[$name].[chunkhash:5].js',
        path         : path.resolve(__dirname, "./dist/www"),
        chunkFilename: '_asset_/script/chunk/[$name].[chunkhash:5].chunk.js',
        publicPath   : "/"//可配置CDN地址
    },
    mode: 'development'

};

module.exports = webpackCfg;
// module.exports=config;
