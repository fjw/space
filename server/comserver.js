// -----------------------------------
log = require( __dirname + "/lib/log.js");
oi = require( __dirname + "/lib/oi.js");
vector = new require( __dirname + "/lib/vector.js")();

var MONGODB = require('mongodb');
var colors  = require('colors');
var _ = require( __dirname + "/lib/lodash.js");
var WORLD = require( __dirname + "/lib/world.js");
var USERCONNECTION = require( __dirname + "/lib/userconnection.js");
// -----------------------------------

var port, env = process.env.NODE_ENV;
if( env == 'production' ) {

    // ---- production-config
    port = 443;

} else {

    // ---- development-config
    port = 4004;
    env = "development";
}

log("info", "[" + env + "] communication-server listening on " + port);


var userconnection = new USERCONNECTION(port, function(c) {



});