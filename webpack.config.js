// "use strict";
// import path from 'path';
// const alias    = {
//     // comm: path.resolve(__dirname, "../src/script/comm.js"),
//     vue: 'vue/dist/vue.js'
// };
let webpackCfg = {
    devtool: "cheap-module-source-map",
    entry  : './src/index.js',
    output : {
        filename     : '[name].js',
        path         : new URL('./dist/www', import.meta.url).pathname,
        chunkFilename: '_asset_/script/chunk/[$name].[chunkhash:5].chunk.js',
        publicPath   : "/",
        libraryTarget: "umd",
    },
    mode   : 'development'
};
export default webpackCfg;
