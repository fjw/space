require('newrelic');

// -----------------------------------
log = require( __dirname + "/lib/log.js");
oi = require( __dirname + "/lib/oi.js");
var colors  = require('colors');
var STATIC = require('node-static');
// -----------------------------------


var respath, port, env = process.env.NODE_ENV, cfg = {};
if( env == 'production' ) {

    // ---- production-config
    respath = __dirname + '/../client/build';
    cfg = {
        cache: 60 * 60 * 72  // 3 days
    };
    port = 80;

} else {

    // ---- development-config
    respath = __dirname + '/../client/src';
    port = 8090;
    env = "development";

}

log("info", "[" + env + "] resource-server listening on " + port);

var fileServer = new STATIC.Server(respath, cfg);

require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        fileServer.serve(request, response);
    });
    request.resume();
}).listen(port);

