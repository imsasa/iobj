const wallabyWebpack = require('wallaby-webpack');
const webpackPostprocessor = wallabyWebpack({});
module.exports = function (wallaby) {
    return {
        files: [
            { pattern:   'src/**/*.js'},
            { pattern:   'assets/*.js'}
        ],

        tests: [
            { pattern:  'tests/*.js'}
        ],
        env: {
            type: 'node',
            runner:"node"
            // params: {
            //     runner: `-r ${require.resolve('esm')}`
            // }
        },
        compilers: {
            '**/*.js': wallaby.compilers.babel({ babelrc: true})
        }
        // setup: function (w) {
        //     require('@babel/register')();
        // }
        // testFramework: 'mocha',
        // postprocessor: webpackPostprocessor,
        // debug: true
        // compilers: {
        //     '**/*.js': wallaby.compilers.babel()
        // }
        // postprocessor: webpackPostprocessor,

        // setup: function () {
        //     window.expect = chai.expect;
        //     window.__moduleBundler.loadTests();
        // }
    };
};