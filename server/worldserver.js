var env = process.env.NODE_ENV;

// -----------------------------------
log = require( __dirname + "/lib/log.js");
oi = require( __dirname + "/lib/oi.js");
_ = require( __dirname + "/lib/lodash.js");

var zmq = require('zmq');
var servercfg = require( __dirname + "/lib/servercfg.js");
var colors  = require('colors');
var WORLD = require( __dirname + "/lib/masterworld.js");
// -----------------------------------

var worldname = "testarena";

if(process.env.SPACE_WORLD) {
    worldname = process.env.SPACE_WORLD;
}

// -----------------------------------



// Welt erzeugen
var world = new WORLD(worldname);

// ------------------------- Main Loop ----------------------------

setInterval(function() {
    world.update();
}, servercfg.updateinterval.worldloop);



