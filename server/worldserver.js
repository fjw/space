var env = process.env.NODE_ENV;

if( env == 'production' ) { require('newrelic'); }

// -----------------------------------
log = require( __dirname + "/lib/log.js");
oi = require( __dirname + "/lib/oi.js");
vector = new require( __dirname + "/lib/vector.js")();

var zmq = require('zmq');
var servercfg = require( __dirname + "/lib/servercfg.js");
var colors  = require('colors');
var _ = require( __dirname + "/lib/lodash.js");
var WORLD = require( __dirname + "/lib/masterworld.js");
// -----------------------------------

var worldname = "testarena";

// -----------------------------------



// Welt erzeugen
var world = new WORLD(worldname);

// ------------------------- Main Loop ----------------------------

setInterval(function() {
    world.update();
}, servercfg.updateinterval.worldloop);



