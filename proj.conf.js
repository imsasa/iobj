module.exports.dev    = {
    host       : "",
    port       : 8282,//defalut 8181,
    contentBase: './dist/www/',
    addr       : undefined,
    https      : false
};
module.exports.server = {
    host       : "mysite.com",
    contentBase: './dist/www/',
};

module.exports.page = {
    commLib: [],
    favicon: './src/img/favicon.png'
};
module.exports.zip  = {
    dest    : "./dist/",
    source  : "./dist/www/",
    wrap    : '',
    fileName: 'www.zip'
};
module.exports.ftp  = {
    server: {
        host    : "10.123.118.203",
        user    : "all",
        password: "root@all"
    },
    dest  : "",
    source: '/dist/www.zip'
};
module.exports.svn  = {
    source: "./dist/www/",
    dest  : "d:/ddd/"
};
