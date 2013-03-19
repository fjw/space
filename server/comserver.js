// -----------------------------------
log = require( __dirname + "/lib/log.js");
oi = require( __dirname + "/lib/oi.js");
vector = new require( __dirname + "/lib/vector.js")();

var MONGODB = require('mongodb');
var colors  = require('colors');
var _ = require( __dirname + "/lib/lodash.js");
var WORLD = require( __dirname + "/lib/world.js");
var WEBSOCKET = require('ws');
// -----------------------------------


var wss = new WEBSOCKET.Server({port: 4004});


wss.on('connection', function(ws) {


    ws.on('message', function(message) {
        console.log('received: %s', message);
    });


    ws.send('something');
});
